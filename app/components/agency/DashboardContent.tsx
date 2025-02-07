"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart, DollarSign, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { SkeletonText } from "../SkeletonLoading"

interface DashboardSummary {
  totalClients: number
  activeCampaigns: number
  totalRevenue: number
  averageROI: number
}

interface RecentActivity {
  id: string
  description: string
  timestamp: Timestamp
  details?: string
}

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({
    totalClients: 0,
    activeCampaigns: 0,
    totalRevenue: 0,
    averageROI: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDashboardData(user.uid)
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchDashboardData = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // Check if the user is an agency
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists() || userDoc.data().userType !== "agency") {
        throw new Error("Unauthorized access")
      }

      // Fetch or create summary data
      const summaryDocRef = doc(db, "agencySummary", userId)
      let summaryDoc = await getDoc(summaryDocRef)

      if (!summaryDoc.exists()) {
        const initialSummary: DashboardSummary = {
          totalClients: 0,
          activeCampaigns: 0,
          totalRevenue: 0,
          averageROI: 0,
        }
        await setDoc(summaryDocRef, initialSummary)
        summaryDoc = await getDoc(summaryDocRef)
      }

      const summaryData = summaryDoc.data() as DashboardSummary
      setSummary(summaryData)

      // Fetch total number of clients
      const clientsSnapshot = await getDocs(query(collection(db, "clients"), where("agencyId", "==", userId)))
      const totalClients = clientsSnapshot.size

      // Update the summary with the correct number of clients
      if (totalClients !== summaryData.totalClients) {
        const updatedSummary = { ...summaryData, totalClients }
        await updateDoc(summaryDocRef, { totalClients })
        setSummary(updatedSummary)
      }

      // Fetch recent activity
      const recentActivityQuery = query(
        collection(db, "recentActivity"),
        where("agencyId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(5),
      )
      const recentActivitySnapshot = await getDocs(recentActivityQuery)

      const recentActivityData = recentActivitySnapshot.docs.map((doc) => {
        const data = doc.data() as RecentActivity
        return {
          id: doc.id,
          ...data,
          description: formatActivityDescription(data.description, data.details),
        }
      })

      setRecentActivity(recentActivityData)

      // Clean up old activities
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const oldActivitiesQuery = query(
        collection(db, "recentActivity"),
        where("agencyId", "==", userId),
        where("timestamp", "<", twentyFourHoursAgo),
      )
      const oldActivitiesSnapshot = await getDocs(oldActivitiesQuery)
      oldActivitiesSnapshot.docs.forEach((doc) => {
        deleteDoc(doc.ref)
      })
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError("Falha ao carregar dados do dashboard. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatActivityDescription = (description: string, details?: string) => {
    if (description.startsWith("Cliente excluído:") && details) {
      return `Cliente excluído: ${details}`
    }
    return description
  }

  const handleClearActivities = async () => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      const activitiesQuery = query(collection(db, "recentActivity"), where("agencyId", "==", user.uid))
      const activitiesSnapshot = await getDocs(activitiesQuery)

      const deletePromises = activitiesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add a new activity to show that activities were cleared
      await setDoc(doc(collection(db, "recentActivity")), {
        agencyId: user.uid,
        description: "Todas as atividades recentes foram limpas",
        timestamp: serverTimestamp(),
      })

      fetchDashboardData(user.uid)
    } catch (err) {
      console.error("Error clearing activities:", err)
      setError("Falha ao limpar atividades. Por favor, tente novamente.")
    }
  }

  const renderSummaryCard = (title: string, value: number | string, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  const renderContent = () => (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {renderSummaryCard(
          "Total de Clientes",
          summary.totalClients,
          <Users className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderSummaryCard(
          "Campanhas Ativas",
          summary.activeCampaigns,
          <FileText className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderSummaryCard(
          "Receita Total",
          `R$ ${summary.totalRevenue.toLocaleString()}`,
          <DollarSign className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderSummaryCard(
          "ROI Médio",
          `${summary.averageROI}%`,
          <BarChart className="h-4 w-4 text-muted-foreground" />,
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Atividade Recente</h2>
          <Button variant="outline" size="sm" onClick={handleClearActivities} className="flex items-center">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Atividades
          </Button>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.description}</h4>
                  <p className="text-sm text-gray-500">{activity.timestamp.toDate().toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
          )}
        </div>
      </div>
    </>
  )

  const renderSkeleton = () => (
    <>
      <SkeletonText className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SkeletonText className="h-4 w-24" />
              <SkeletonText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <SkeletonText className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <SkeletonText className="h-6 w-32" />
          <SkeletonText className="h-8 w-24" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <SkeletonText className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <SkeletonText className="h-4 w-3/4 mb-2" />
                <SkeletonText className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return <div className="p-6">{isLoading ? renderSkeleton() : error ? <div>Erro: {error}</div> : renderContent()}</div>
}

