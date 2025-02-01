"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const performanceData = [
  { month: "Jan", impressions: 100000, clicks: 5000, conversions: 500 },
  { month: "Feb", impressions: 120000, clicks: 6000, conversions: 600 },
  { month: "Mar", impressions: 140000, clicks: 7000, conversions: 700 },
  { month: "Apr", impressions: 160000, clicks: 8000, conversions: 800 },
  { month: "May", impressions: 180000, clicks: 9000, conversions: 900 },
  { month: "Jun", impressions: 200000, clicks: 10000, conversions: 1000 },
]

const channelPerformance = [
  { name: "Social Media", performance: 85 },
  { name: "Email", performance: 72 },
  { name: "SEO", performance: 95 },
  { name: "PPC", performance: 60 },
  { name: "Content Marketing", performance: 88 },
]

export function ReportsContent() {
  const [selectedMetric, setSelectedMetric] = useState("impressions")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">900,000</div>
            <p className="text-xs text-muted-foreground">+20.1% desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,000</div>
            <p className="text-xs text-muted-foreground">+15% desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,500</div>
            <p className="text-xs text-muted-foreground">+10% desde o último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10%</div>
            <p className="text-xs text-muted-foreground">+2% desde o último mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedMetric} defaultValue={selectedMetric}>
              <SelectTrigger className="w-[180px] mb-4">
                <SelectValue placeholder="Selecione a métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impressions">Impressões</SelectItem>
                <SelectItem value="clicks">Cliques</SelectItem>
                <SelectItem value="conversions">Conversões</SelectItem>
              </SelectContent>
            </Select>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={selectedMetric} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformance}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

