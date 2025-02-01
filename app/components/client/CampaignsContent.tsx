"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed"
  budget: number
  spent: number
  performance: number
}

const mockCampaigns: Campaign[] = [
  { id: "1", name: "Summer Sale", status: "active", budget: 5000, spent: 2500, performance: 120 },
  { id: "2", name: "Product Launch", status: "active", budget: 10000, spent: 8000, performance: 95 },
  { id: "3", name: "Brand Awareness", status: "paused", budget: 3000, spent: 1500, performance: 80 },
  { id: "4", name: "Holiday Special", status: "completed", budget: 7000, spent: 7000, performance: 150 },
]

export function CampaignsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suas Campanhas</h1>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar campanhas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Orçamento</TableHead>
            <TableHead>Gasto</TableHead>
            <TableHead>Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCampaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>R$ {campaign.budget.toLocaleString()}</TableCell>
              <TableCell>R$ {campaign.spent.toLocaleString()}</TableCell>
              <TableCell>{campaign.performance}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

