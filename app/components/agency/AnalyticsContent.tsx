"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface AnalyticsData {
  totalRevenue: number
  activeClients: number
  activeCampaigns: number
  averageROI: number
  performanceData: Array<{
    month: string
    revenue: number
    expenses: number
  }>
  campaignPerformance: Array<{
    name: string
    performance: number
  }>
}

export function AnalyticsContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user")

        // Fetch analytics data
        const analyticsDoc = await getDoc(doc(db, "analytics", user.uid))

        let currentAnalyticsData: AnalyticsData
        if (!analyticsDoc.exists()) {
          // If analytics data doesn't exist, create it with default values
          currentAnalyticsData = {
            totalRevenue: 0,
            activeClients: 0,
            activeCampaigns: 0,
            averageROI: 0,
            performanceData: [],
            campaignPerformance: [],
          }
          await setDoc(doc(db, "analytics", user.uid), currentAnalyticsData)
        } else {
          currentAnalyticsData = analyticsDoc.data() as AnalyticsData
        }

        // Fetch performance data
        try {
          const performanceQuery = query(
            collection(db, "monthlyPerformance"),
            where("agencyId", "==", user.uid),
            orderBy("month"),
            limit(6),
          )
          const performanceSnapshot = await getDocs(performanceQuery)
          currentAnalyticsData.performanceData = performanceSnapshot.docs.map(
            (doc) => doc.data() as AnalyticsData["performanceData"][0],
          )
        } catch (err) {
          console.error("Error fetching performance data:", err)
          currentAnalyticsData.performanceData = []
        }

        // Fetch campaign performance data
        try {
          const campaignPerformanceQuery = query(
            collection(db, "campaignPerformance"),
            where("agencyId", "==", user.uid),
            orderBy("performance", "desc"),
            limit(5),
          )
          const campaignPerformanceSnapshot = await getDocs(campaignPerformanceQuery)
          currentAnalyticsData.campaignPerformance = campaignPerformanceSnapshot.docs.map(
            (doc) => doc.data() as AnalyticsData["campaignPerformance"][0],
          )
        } catch (err) {
          console.error("Error fetching campaign performance data:", err)
          currentAnalyticsData.campaignPerformance = []
        }

        setAnalyticsData(currentAnalyticsData)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (isLoading) return <div>Loading analytics data...</div>
  if (error) return <div>Error: {error}</div>
  if (!analyticsData) return <div>No analytics data available.</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analyticsData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{analyticsData.activeClients}</div>
            <p className="text-xs text-muted-foreground">+180.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+19% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageROI}%</div>
            <p className="text-xs text-muted-foreground">+5.4% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Nenhum dado de performance disponível.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.campaignPerformance}>
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
      </div>
    </div>
  )
}

