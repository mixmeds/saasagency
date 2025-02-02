"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, BarChart, DollarSign } from "lucide-react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"
import { Skeleton, SkeletonText } from "../SkeletonLoading"

interface RecentActivity {
  id: string
  type: string
  description: string
  time: string
}

interface DashboardSummary {
  totalClients: number
  activeCampaigns: number
  totalRevenue: number
  averageROI: number
}

export function DashboardContent() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({
    totalClients: 0,
    activeCampaigns: 0,
    totalRevenue: 0,
    averageROI: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user")

        // Fetch summary data
        const summaryDoc = await getDocs(
          query(collection(db, "agencySummary"), where("agencyId", "==", user.uid), limit(1)),
        )
        if (!summaryDoc.empty) {
          const summaryData = summaryDoc.docs[0].data() as DashboardSummary
          setSummary(summaryData)
        }

        // Fetch recent activity
        const activityQuery = query(
          collection(db, "recentActivity"),
          where("agencyId", "==", user.uid),
          orderBy("time", "desc"),
          limit(5),
        )
        const activitySnapshot = await getDocs(activityQuery)
        const activityData = activitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RecentActivity[]
        setRecentActivity(activityData)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        if (err.code === "failed-precondition") {
          setError("É necessário criar um índice para as atividades recentes. Por favor, contate o administrador.")
        } else {
          setError("Falha ao carregar dados do dashboard. Por favor, tente novamente.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
        <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <SkeletonText className="w-3/4 h-4 mb-2" />
                  <SkeletonText className="w-1/2 h-3" />
                </div>
              </div>
            ))
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : recentActivity.length > 0 ? (
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
                  <p className="text-sm text-gray-500">{activity.time}</p>
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

