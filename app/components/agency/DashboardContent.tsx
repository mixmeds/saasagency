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

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      // Fetch or create summary data
      const summaryDocRef = doc(db, "agencySummary", user.uid)
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
      const clientsSnapshot = await getDocs(query(collection(db, "clients"), where("agencyId", "==", user.uid)))
      const totalClients = clientsSnapshot.size

      // Update the summary with the correct number of clients
      if (totalClients !== summaryData.totalClients) {
        const updatedSummary = { ...summaryData, totalClients }
        await updateDoc(summaryDocRef, { totalClients })
        setSummary(updatedSummary)
      }

      // Fetch recent activity
      try {
        const recentActivityQuery = query(
          collection(db, "recentActivity"),
          where("agencyId", "==", user.uid),
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
      } catch (err: any) {
        if (err.code === "failed-precondition") {
          console.error("Index not created for recent activity query:", err)
          setError(
            "É necessário criar um índice para as atividades recentes. Por favor, siga as instruções no console do Firebase.",
          )
        } else {
          throw err
        }
      }

      // Clean up old activities
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const oldActivitiesQuery = query(
          collection(db, "recentActivity"),
          where("agencyId", "==", user.uid),
          where("timestamp", "<", twentyFourHoursAgo),
        )
        const oldActivitiesSnapshot = await getDocs(oldActivitiesQuery)
        oldActivitiesSnapshot.docs.forEach((doc) => {
          deleteDoc(doc.ref)
        })
      } catch (err: any) {
        if (err.code === "failed-precondition") {
          console.error("Index not created for old activities cleanup query:", err)
          // We don't set an error here as it's not critical for the user experience
        } else {
          throw err
        }
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError("Falha ao carregar dados do dashboard. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [auth.currentUser]) // Added auth.currentUser as a dependency

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

      fetchDashboardData()
    } catch (err) {
      console.error("Error clearing activities:", err)
      setError("Falha ao limpar atividades. Por favor, tente novamente.")
    }
  }

  if (isLoading) return <div>Carregando dados do dashboard...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageROI}%</div>
          </CardContent>
        </Card>
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
    </div>
  )
}

