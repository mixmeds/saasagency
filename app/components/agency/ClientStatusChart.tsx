"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Client {
  status: "Potencial" | "Em negociação" | "Fechado" | "Perdido"
}

interface ClientStatusChartProps {
  clients: Client[]
}

export function ClientStatusChart({ clients }: ClientStatusChartProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    const statusCounts = clients.reduce(
      (acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const data = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    setChartData(data)
  }, [clients])

  if (!chartData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Clientes por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </CardContent>
    </Card>
  )
}

