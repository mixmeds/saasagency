"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface DashboardData {
  activeCampaigns: number
  averageROI: number
  totalReach: number
  totalConversions: number
  campaignPerformance: Array<{
    name: string
    performance: number
  }>
  roiData: Array<{
    month: string
    roi: number
  }>
}

export function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user")

        // Fetch dashboard data
        const dashboardDoc = await getDoc(doc(db, "clientDashboard", user.uid))

        let currentDashboardData: DashboardData
        if (!dashboardDoc.exists()) {
          // If dashboard data doesn't exist, create it with default values
          currentDashboardData = {
            activeCampaigns: 0,
            averageROI: 0,
            totalReach: 0,
            totalConversions: 0,
            campaignPerformance: [],
            roiData: [],
          }
          await setDoc(doc(db, "clientDashboard", user.uid), currentDashboardData)
        } else {
          currentDashboardData = dashboardDoc.data() as DashboardData
        }

        // Fetch campaign performance data
        try {
          const campaignPerformanceQuery = query(
            collection(db, "campaignPerformance"),
            where("clientId", "==", user.uid),
            orderBy("performance", "desc"),
            limit(6),
          )
          const campaignPerformanceSnapshot = await getDocs(campaignPerformanceQuery)
          const campaignPerformanceData = campaignPerformanceSnapshot.docs.map(
            (doc) => doc.data() as DashboardData["campaignPerformance"][0],
          )
          currentDashboardData.campaignPerformance = campaignPerformanceData
        } catch (err) {
          console.error("Error fetching campaign performance data:", err)
          // If there's an error, we'll just use an empty array
          currentDashboardData.campaignPerformance = []
        }

        // Fetch ROI data
        try {
          const roiQuery = query(
            collection(db, "clientROI"),
            where("clientId", "==", user.uid),
            orderBy("month"),
            limit(6),
          )
          const roiSnapshot = await getDocs(roiQuery)
          const roiData = roiSnapshot.docs.map((doc) => doc.data() as DashboardData["roiData"][0])
          currentDashboardData.roiData = roiData
        } catch (err) {
          console.error("Error fetching ROI data:", err)
          // If there's an error, we'll just use an empty array
          currentDashboardData.roiData = []
        }

        setDashboardData(currentDashboardData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) return <div>Loading dashboard data...</div>
  if (error) return <div>Error: {error}</div>
  if (!dashboardData) return <div>No dashboard data available.</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+1 desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.averageROI}%</div>
            <p className="text-xs text-muted-foreground">+15% desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10% desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% desde o último mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.campaignPerformance}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>Nenhum dado de performance de campanha disponível.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ROI ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.roiData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.roiData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="roi" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Nenhum dado de ROI disponível.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

