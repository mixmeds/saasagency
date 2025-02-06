"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileSearch } from "lucide-react"

interface Collaborator {
  id: string
  name: string
  email: string
  role: string
}

export function CollaboratorsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  const handleAddCollaborator = () => {
    console.log("Add collaborator")
  }

  const handleSearch = () => {
    console.log("Search collaborators")
  }

  const handleAdvancedSearch = () => {
    console.log("Advanced search")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Button onClick={handleAddCollaborator}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Colaborador
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" /> Buscar
        </Button>
        <Button variant="outline" onClick={handleAdvancedSearch}>
          <FileSearch className="h-4 w-4 mr-2" /> Busca Avançada
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collaborator) => (
            <TableRow key={collaborator.id}>
              <TableCell>{collaborator.name}</TableCell>
              <TableCell>{collaborator.email}</TableCell>
              <TableCell>{collaborator.role}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => console.log("Edit collaborator", collaborator.id)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

