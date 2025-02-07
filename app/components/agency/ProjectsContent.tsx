"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface Project {
  id: string
  name: string
  client: string
  status: "Em andamento" | "Concluído" | "Atrasado"
  startDate: Date
  endDate: Date
}

export function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      const projectsQuery = query(collection(db, "projects"), where("agencyId", "==", user.uid))
      const projectsSnapshot = await getDocs(projectsQuery)

      const projectsData = projectsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate.toDate(),
            endDate: doc.data().endDate.toDate(),
          }) as Project,
      )

      setProjects(projectsData)
    } catch (err: any) {
      console.error("Erro ao buscar projetos:", err)
      setError(`Falha ao carregar projetos: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    // Implementar lógica de busca
  }

  const handleAddProject = () => {
    // Implementar lógica para adicionar projeto
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Em andamento":
        return "bg-blue-100 text-blue-800"
      case "Concluído":
        return "bg-green-100 text-green-800"
      case "Atrasado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <Button onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Projeto
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" /> Buscar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Início</TableHead>
            <TableHead>Data de Término</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </TableCell>
              <TableCell>{project.startDate.toLocaleDateString()}</TableCell>
              <TableCell>{project.endDate.toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isLoading && <div className="text-center mt-4">Carregando projetos...</div>}
    </div>
  )
}

