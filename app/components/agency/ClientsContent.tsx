"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, ChevronDown, ChevronUp, Users, FileSearch, FileUp } from "lucide-react"
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
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"
import { AddClientForm } from "./AddClientForm"
import { Modal } from "../Modal"
import { ClientDetails } from "./ClientDetails"
import { ClientStatusChart } from "./ClientStatusChart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonText } from "../SkeletonLoading"
import { AdvancedSearchModal } from "../AdvancedSearchModal"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkEditCard } from "./BulkEditCard"
import { BulkEditForm } from "./BulkEditForm"
import { ExportCSVButton } from "./ExportCSVButton"

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
  const router = useRouter()
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isBulkEditMode, setIsBulkEditMode] = useState(false)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [showBulkEditForm, setShowBulkEditForm] = useState(false)

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Redirecionar para a página de login se não estiver autenticado
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

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
    if (!isAuthenticated) {
      setError("Você precisa estar autenticado para realizar esta ação.")
      return
    }
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

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const handleClientSelection = (clientId: string, event: React.MouseEvent<HTMLInputElement>) => {
    if (event.shiftKey && selectedClients.length > 0) {
      const clientIds = clients.map((client) => client.id)
      const lastSelectedIndex = clientIds.indexOf(selectedClients[selectedClients.length - 1])
      const currentIndex = clientIds.indexOf(clientId)
      const start = Math.min(lastSelectedIndex, currentIndex)
      const end = Math.max(lastSelectedIndex, currentIndex)
      const newSelectedClients = clientIds.slice(start, end + 1)
      setSelectedClients((prev) => Array.from(new Set([...prev, ...newSelectedClients])))
    } else {
      toggleClientSelection(clientId)
    }
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" /> Buscar
          </Button>
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
          </Button>
          <Button onClick={() => setIsBulkEditMode(true)}>
            <Users className="mr-2 h-4 w-4" /> Edição em Massa
          </Button>
          <ExportCSVButton clients={clients} />
          <Button onClick={() => console.log("Importar CSV")}>
            <FileUp className="mr-2 h-4 w-4" /> Importar CSV
          </Button>
          <Button onClick={() => setShowAdvancedSearch(true)}>
            <FileSearch className="mr-2 h-4 w-4" /> Busca Avançada
          </Button>
        </div>

        <ClientStatusChart clients={clients} />

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              {isBulkEditMode && <TableHead className="w-[50px]">Selecionar</TableHead>}
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
              <TableRow key={client.id} className="hover:bg-gray-50">
                {isBulkEditMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) =>
                        handleClientSelection(client.id, checked as unknown as React.MouseEvent<HTMLInputElement>)
                      }
                    />
                  </TableCell>
                )}
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
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}>
                      <Edit className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {expandedClientId &&
          clients.map(
            (client) =>
              expandedClientId === client.id && (
                <TableRow>
                  <TableCell colSpan={isBulkEditMode ? 7 : 6}>
                    <div className="p-4 bg-gray-50">
                      <h4 className="font-semibold mb-2">Detalhes adicionais:</h4>
                      <p>
                        <strong>Endereço:</strong> {client.endereco}
                      </p>
                      <p>
                        <strong>Documento:</strong> {client.documento}
                      </p>
                      <h4 className="font-semibold mt-4 mb-2">Anotações:</h4>
                      <ul className="list-disc pl-5">
                        {client.anotacoes.map((anotacao, index) => (
                          <li key={index}>{anotacao}</li>
                        ))}
                      </ul>
                    </div>
                  </TableCell>
                </TableRow>
              ),
          )}

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
      </div>
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
                if (clientToDelete && isAuthenticated) {
                  try {
                    const user = auth.currentUser
                    if (!user) throw new Error("Usuário não autenticado")

                    const clientRef = doc(db, "clients", clientToDelete)
                    const clientDoc = await getDoc(clientRef)

                    if (!clientDoc.exists()) {
                      throw new Error("Cliente não encontrado")
                    }

                    const clientData = clientDoc.data()
                    if (clientData.agencyId !== user.uid) {
                      throw new Error("Você não tem permissão para excluir este cliente")
                    }

                    await deleteDoc(clientRef)

                    // Adicionar atividade recente para exclusão de cliente
                    await addDoc(collection(db, "recentActivity"), {
                      agencyId: user.uid,
                      description: "Cliente excluído",
                      details: clientData.nome,
                      timestamp: serverTimestamp(),
                    })

                    fetchClients()
                    setSelectedClient(null)
                    setClientToDelete(null)
                  } catch (err: any) {
                    console.error("Erro ao excluir cliente:", err)
                    setError(`Falha ao excluir cliente: ${err.message}`)
                  }
                } else {
                  setError("Você precisa estar autenticado para realizar esta ação.")
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
      {isBulkEditMode && (
        <BulkEditCard
          selectedClients={selectedClients}
          onCancel={() => {
            setIsBulkEditMode(false)
            setSelectedClients([])
          }}
          onEdit={() => {
            setShowBulkEditForm(true)
          }}
        />
      )}
      <Modal isOpen={showBulkEditForm} onClose={() => setShowBulkEditForm(false)} size="lg">
        <BulkEditForm
          selectedClients={selectedClients}
          onClose={() => {
            setShowBulkEditForm(false)
            setIsBulkEditMode(false)
            setSelectedClients([])
          }}
          onClientsUpdated={() => {
            fetchClients()
            setShowBulkEditForm(false)
            setIsBulkEditMode(false)
            setSelectedClients([])
          }}
        />
      </Modal>
    </div>
  )
}

