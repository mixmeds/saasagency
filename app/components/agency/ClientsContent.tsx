"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"
import { AddClientForm } from "./AddClientForm"
import { Modal } from "../Modal"
import { EditClientForm } from "./EditClientForm" // Import EditClientForm

interface Client {
  id: string
  name: string
  email: string
  company: string
  phone: string
  address: string
  website: string
  activeCampaigns: number
  totalSpend: number
}

export function ClientsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

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

  useEffect(() => {
    fetchClients()
  }, [auth.currentUser]) // Added auth.currentUser as a dependency

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddClient = () => {
    setShowAddForm(true)
  }

  const handleClientAdded = () => {
    setShowAddForm(false)
    fetchClients()
  }

  const handleExpandClient = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
  }

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      await updateDoc(doc(db, "clients", updatedClient.id), updatedClient)
      setEditingClient(null)
      fetchClients()
    } catch (err) {
      console.error("Error updating client:", err)
      setError("Failed to update client. Please try again.")
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteDoc(doc(db, "clients", clientId))
        setEditingClient(null) // Fechar o modal de edição
        fetchClients()
      } catch (err) {
        console.error("Erro ao excluir cliente:", err)
        setError("Falha ao excluir cliente. Por favor, tente novamente.")
      }
    }
  }

  if (isLoading) return <div>Loading clients...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={handleAddClient}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
        </Button>
      </div>

      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <AddClientForm onClientAdded={handleClientAdded} onCancel={() => setShowAddForm(false)} />
      </Modal>

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
            <TableHead>Empresa</TableHead>
            <TableHead>Campanhas Ativas</TableHead>
            <TableHead>Gasto Total</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <>
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.company}</TableCell>
                <TableCell>{client.activeCampaigns}</TableCell>
                <TableCell>R$ {client.totalSpend.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleExpandClient(client.id)}>
                      {expandedClient === client.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedClient === client.id && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2">Informações Adicionais</h3>
                      <p>
                        <strong>Telefone:</strong> {client.phone}
                      </p>
                      <p>
                        <strong>Endereço:</strong> {client.address}
                      </p>
                      {client.website && (
                        <p>
                          <strong>Website:</strong> {client.website}
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={!!editingClient} onClose={() => setEditingClient(null)}>
        {editingClient && (
          <EditClientForm
            client={editingClient}
            onClientUpdated={handleUpdateClient}
            onCancel={() => setEditingClient(null)}
            onDelete={() => handleDeleteClient(editingClient.id)}
          />
        )}
      </Modal>
    </div>
  )
}

