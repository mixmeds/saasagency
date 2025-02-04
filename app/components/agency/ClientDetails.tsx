"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/app/lib/firebase"

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const clientRef = doc(db, "clients", client.id)
      await updateDoc(clientRef, {
        anotacoes: arrayUnion(newNote),
      })
      setEditedClient((prev) => ({ ...prev, anotacoes: [...prev.anotacoes, newNote] }))
      setNewNote("")
      onUpdate()
    } catch (err) {
      console.error("Erro ao adicionar anotação:", err)
      setError("Falha ao adicionar anotação. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Detalhes do Cliente</h2>
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
          <ul className="list-disc pl-5 mb-2">
            {editedClient.anotacoes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <Textarea
              id="newNote"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Adicionar nova anotação..."
            />
            <Button type="button" onClick={handleAddNote} disabled={isLoading}>
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
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete}>
            Excluir Cliente
          </Button>
        </div>
      </form>
    </div>
  )
}

