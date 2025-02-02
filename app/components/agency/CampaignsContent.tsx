"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface Campaign {
  id: string
  name: string
  client: string
  status: "active" | "paused" | "completed"
  budget: number
  performance: number
}

export function CampaignsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user")

        const campaignsQuery = query(collection(db, "campaigns"), where("agencyId", "==", user.uid))
        const campaignsSnapshot = await getDocs(campaignsQuery)
        const campaignsData = campaignsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Campaign,
        )
        setCampaigns(campaignsData)
      } catch (err) {
        console.error("Error fetching campaigns:", err)
        setError("Failed to load campaigns. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.client.toLowerCase().includes(searchTerm.toLowerCase()),
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

  if (isLoading) return <div>Loading campaigns...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campanhas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Campanha
        </Button>
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
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Orçamento</TableHead>
            <TableHead>Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCampaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.client}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>R$ {campaign.budget.toLocaleString()}</TableCell>
              <TableCell>{campaign.performance}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

