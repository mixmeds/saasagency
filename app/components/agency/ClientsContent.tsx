"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface Client {
  id: string
  name: string
  email: string
  activeCampaigns: number
  totalSpend: number
}

export function ClientsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const user = auth.currentUser
        if (!user) throw new Error("No authenticated user")

        const clientsQuery = query(collection(db, "clients"), where("agencyId", "==", user.uid))
        const clientsSnapshot = await getDocs(clientsQuery)
        const clientsData = clientsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Client,
        )
        setClients(clientsData)
      } catch (err) {
        console.error("Error fetching clients:", err)
        setError("Failed to load clients. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) return <div>Loading clients...</div>
  if (error) return <div>Error: {error}</div>

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

