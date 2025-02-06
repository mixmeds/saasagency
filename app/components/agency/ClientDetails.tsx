"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { Trash2, Loader2 } from "lucide-react"
import { SkeletonText } from "../SkeletonLoading"

interface Client {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  status: "Potencial" | "Em negociação" | "Fechado" | "Perdido"
  anotacoes: string[]
}

interface ClientDetailsProps {
  client: Client
  onUpdate: () => void
  onDelete: () => void
  onClose: () => void
}

export function ClientDetails({ client, onUpdate, onDelete, onClose }: ClientDetailsProps) {
  const [editedClient, setEditedClient] = useState(client)
  const [newNote, setNewNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedClient((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setEditedClient((prev) => ({ ...prev, status: value as Client["status"] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const clientRef = doc(db, "clients", client.id)
      await updateDoc(clientRef, editedClient)
      onUpdate()
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err)
      setError("Falha ao atualizar cliente. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    setEditedClient((prev) => ({
      ...prev,
      anotacoes: [...prev.anotacoes, newNote],
    }))
    setNewNote("")
  }

  const handleDeleteNote = (noteToDelete: string) => {
    setEditedClient((prev) => ({
      ...prev,
      anotacoes: prev.anotacoes.filter((note) => note !== noteToDelete),
    }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Detalhes do Cliente</h2>
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonText className="h-8 w-1/4" />
          <SkeletonText className="h-4 w-3/4" />
          <SkeletonText className="h-4 w-2/3" />
          <SkeletonText className="h-4 w-1/2" />
          <SkeletonText className="h-4 w-1/2" />
          <SkeletonText className="h-4 w-1/2" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" value={editedClient.nome} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={editedClient.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" value={editedClient.telefone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="empresa">Empresa</Label>
            <Input id="empresa" name="empresa" value={editedClient.empresa} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={handleStatusChange} defaultValue={editedClient.status}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Potencial">Potencial</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="anotacoes">Anotações</Label>
            <ul className="list-none space-y-2 mb-2">
              {editedClient.anotacoes.map((note, index) => (
                <li key={`note-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md group">
                  <span>{note}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2">
              <Textarea
                id="newNote"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar nova anotação..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddNote}
                disabled={isLoading || !newNote.trim()}
                className="self-end"
              >
                Adicionar
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete}>
              Excluir Cliente
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

