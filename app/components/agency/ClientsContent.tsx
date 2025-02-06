"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, ChevronDown, ChevronUp, MessageCircle, Users, UserPlus, FileSearch } from "lucide-react"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"
import { AddClientForm } from "./AddClientForm"
import { Modal } from "../Modal"
import { ClientDetails } from "./ClientDetails"
import { ClientStatusChart } from "./ClientStatusChart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React from "react"
import { SkeletonText } from "../SkeletonLoading"
import { AdvancedSearchModal } from "../AdvancedSearchModal"

interface Client {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  endereco: string
  status: "Potencial" | "Em negociação" | "Fechado" | "Perdido"
  anotacoes: string[]
  dataCriacao: Date
  agencyId: string
  documento: string
}

export function ClientsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  const fetchClients = useCallback(async (searchParams: any = {}, startAfterDoc = null) => {
    setIsLoading(true)
    setError(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      let clientsQuery = query(
        collection(db, "clients"),
        where("agencyId", "==", user.uid),
        orderBy("dataCriacao", "desc"),
        limit(10),
      )

      if (searchParams.nome) {
        clientsQuery = query(
          clientsQuery,
          where("nome", ">=", searchParams.nome),
          where("nome", "<=", searchParams.nome + "\uf8ff"),
        )
      }
      if (searchParams.email) {
        clientsQuery = query(clientsQuery, where("email", "==", searchParams.email))
      }
      if (searchParams.telefone) {
        clientsQuery = query(clientsQuery, where("telefone", "==", searchParams.telefone))
      }
      if (searchParams.empresa) {
        clientsQuery = query(
          clientsQuery,
          where("empresa", ">=", searchParams.empresa),
          where("empresa", "<=", searchParams.empresa + "\uf8ff"),
        )
      }
      if (searchParams.documento) {
        clientsQuery = query(clientsQuery, where("documento", "==", searchParams.documento))
      }

      if (startAfterDoc) {
        clientsQuery = query(clientsQuery, startAfter(startAfterDoc))
      }

      const clientsSnapshot = await getDocs(clientsQuery)

      const clientsData = clientsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            dataCriacao: doc.data().dataCriacao.toDate(),
          }) as Client,
      )

      setClients((prevClients) => (startAfterDoc ? [...prevClients, ...clientsData] : clientsData))
      setLastVisible(clientsSnapshot.docs[clientsSnapshot.docs.length - 1])
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err)
      setError(`Falha ao carregar clientes: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleSearch = () => {
    setClients([])
    setLastVisible(null)
    fetchClients({ nome: searchTerm })
  }

  const handleLoadMore = () => {
    if (lastVisible) {
      fetchClients({}, lastVisible)
    }
  }

  const handleAddClient = () => {
    setShowAddForm(true)
  }

  const handleClientAdded = () => {
    setShowAddForm(false)
    fetchClients()
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
  }

  const handleClientUpdate = () => {
    fetchClients()
    setSelectedClient(null)
  }

  const handleDeleteClient = async (clientId: string) => {
    setClientToDelete(clientId)
  }

  const toggleExpand = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId)
  }

  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "Potencial":
        return "bg-blue-100 text-blue-800"
      case "Em negociação":
        return "bg-yellow-100 text-yellow-800"
      case "Fechado":
        return "bg-green-100 text-green-800"
      case "Perdido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAdvancedSearch = (searchParams: any) => {
    setClients([])
    setLastVisible(null)
    fetchClients(searchParams)
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
          </Button>
          <Button onClick={() => console.log("Bulk edit")}>
            <Users className="mr-2 h-4 w-4" /> Edição em Massa
          </Button>
          <Button onClick={() => console.log("Create account")}>
            <UserPlus className="mr-2 h-4 w-4" /> Criar Conta
          </Button>
          <Button onClick={() => setShowAdvancedSearch(true)}>
            <FileSearch className="mr-2 h-4 w-4" /> Busca Avançada
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" /> Buscar
        </Button>
      </div>

      <ClientStatusChart clients={clients} />

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-bold">Nome</TableHead>
            <TableHead className="font-bold">Email</TableHead>
            <TableHead className="font-bold">Telefone</TableHead>
            <TableHead className="font-bold">Empresa</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <React.Fragment key={client.id}>
              <TableRow key={client.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{client.nome}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.telefone}</TableCell>
                <TableCell>{client.empresa}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleClientSelect(client)}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(client.id)}>
                      {expandedClientId === client.id ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" /> Minimizar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" /> Expandir
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedClientId === client.id && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                      <h4 className="font-semibold mb-2">Informações Adicionais</h4>
                      <p className="mb-2">
                        <strong>Endereço:</strong> {client.endereco}
                      </p>
                      <div className="mb-2">
                        <strong>Anotações:</strong>
                        <ul className="list-disc list-inside pl-4">
                          {client.anotacoes.map((anotacao, index) => (
                            <li key={`${client.id}-anotacao-${index}`}>{anotacao}</li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/${client.telefone.replace(/\D/g, "")}`, "_blank")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" /> Abrir WhatsApp
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {isLoading && (
        <div className="space-y-4 mt-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <SkeletonText className="h-6 w-1/4" />
              <SkeletonText className="h-6 w-1/4" />
              <SkeletonText className="h-6 w-1/4" />
              <SkeletonText className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && lastVisible && (
        <div className="text-center mt-4">
          <Button onClick={handleLoadMore}>Carregar mais</Button>
        </div>
      )}

      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <AddClientForm onClientAdded={handleClientAdded} onCancel={() => setShowAddForm(false)} />
      </Modal>

      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)}>
        {selectedClient && (
          <ClientDetails
            client={selectedClient}
            onUpdate={handleClientUpdate}
            onDelete={() => handleDeleteClient(selectedClient.id)}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!clientToDelete} onClose={() => setClientToDelete(null)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
          <p className="mb-4">Tem certeza que deseja excluir este cliente?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setClientToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (clientToDelete) {
                  try {
                    const clientToDeleteRef = doc(db, "clients", clientToDelete)
                    const clientDoc = await getDocs(query(collection(db, "clients"), where("id", "==", clientToDelete)))
                    const clientName = clientDoc.docs[0].data().nome

                    await deleteDoc(clientToDeleteRef)

                    // Adicionar atividade recente para exclusão de cliente
                    const user = auth.currentUser
                    if (user) {
                      await addDoc(collection(db, "recentActivity"), {
                        agencyId: user.uid,
                        description: "Cliente excluído",
                        details: clientName, // Adicione o nome do cliente aqui
                        timestamp: serverTimestamp(),
                      })
                    }

                    fetchClients()
                    setSelectedClient(null)
                    setClientToDelete(null)
                  } catch (err) {
                    console.error("Erro ao excluir cliente:", err)
                    setError("Falha ao excluir cliente. Por favor, tente novamente.")
                  }
                }
              }}
            >
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  )
}

