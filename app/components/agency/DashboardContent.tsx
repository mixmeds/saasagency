"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart, DollarSign, FileText } from "lucide-react"
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface DashboardSummary {
  totalClients: number
  activeCampaigns: number
  totalRevenue: number
  averageROI: number
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
  const [recentActivity, setRecentActivity] = useState<any[]>([])

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
        try {
          const recentActivityQuery = query(
            collection(db, "recentActivity"),
            where("agencyId", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(5),
          )
          const recentActivitySnapshot = await getDocs(recentActivityQuery)
          const recentActivityData = recentActivitySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRecentActivity(recentActivityData)
        } catch (activityError: any) {
          console.error("Error fetching recent activity:", activityError)
          if (activityError.code === "failed-precondition") {
            // Fallback to a simpler query without ordering
            const simpleRecentActivityQuery = query(
              collection(db, "recentActivity"),
              where("agencyId", "==", user.uid),
              limit(5),
            )
            const recentActivitySnapshot = await getDocs(simpleRecentActivityQuery)
            const recentActivityData = recentActivitySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            setRecentActivity(recentActivityData)
          } else {
            throw activityError
          }
        }
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
          {recentActivity.length > 0 ? (
            recentActivity.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.description}</h4>
                  <p className="text-sm text-gray-500">{new Date(activity.timestamp.toDate()).toLocaleString()}</p>
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

