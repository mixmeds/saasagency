"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  activeCampaigns: number
  totalSpend: number
}

const mockClients: Client[] = [
  { id: "1", name: "Acme Corp", email: "contact@acme.com", activeCampaigns: 3, totalSpend: 15000 },
  { id: "2", name: "Global Tech", email: "info@globaltech.com", activeCampaigns: 2, totalSpend: 8000 },
  { id: "3", name: "Local Shop", email: "owner@localshop.com", activeCampaigns: 1, totalSpend: 3000 },
]

export function ClientsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>(mockClients)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar clientes..."
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
            <TableHead>Email</TableHead>
            <TableHead>Campanhas Ativas</TableHead>
            <TableHead>Gasto Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.activeCampaigns}</TableCell>
              <TableCell>R$ {client.totalSpend.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

