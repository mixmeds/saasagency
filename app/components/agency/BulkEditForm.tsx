"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateDoc, doc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { auth } from "@/app/lib/firebase"

interface BulkEditFormProps {
  selectedClients: string[]
  onClose: () => void
  onClientsUpdated: () => void
}

export function BulkEditForm({ selectedClients, onClose, onClientsUpdated }: BulkEditFormProps) {
  const [formData, setFormData] = useState({
    status: "",
    empresa: "",
    endereco: "",
  })
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    status: false,
    empresa: false,
    endereco: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const updatePromises = selectedClients.map((clientId) => {
        const clientRef = doc(db, "clients", clientId)
        const updateData: { [key: string]: any } = {}

        if (fieldsToUpdate.status && formData.status) {
          updateData.status = formData.status
        }
        if (fieldsToUpdate.empresa && formData.empresa) {
          updateData.empresa = formData.empresa
        }
        if (fieldsToUpdate.endereco && formData.endereco) {
          updateData.endereco = formData.endereco
        }

        return updateDoc(clientRef, updateData)
      })

      await Promise.all(updatePromises)
      onClientsUpdated()
      onClose()
    } catch (err: any) {
      console.error("Erro ao atualizar clientes:", err)
      setError(`Falha ao atualizar clientes: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedClients.length} cliente(s)?`)) {
      setIsLoading(true)
      setError(null)

      try {
        const deletePromises = selectedClients.map((clientId) => {
          const clientRef = doc(db, "clients", clientId)
          return deleteDoc(clientRef)
        })

        await Promise.all(deletePromises)

        // Adicionar atividade recente para exclusão em massa
        const user = auth.currentUser
        if (user) {
          await addDoc(collection(db, "recentActivity"), {
            agencyId: user.uid,
            description: `${selectedClients.length} clientes excluídos em massa`,
            timestamp: serverTimestamp(),
          })
        }

        onClientsUpdated()
        onClose()
      } catch (err: any) {
        console.error("Erro ao excluir clientes em massa:", err)
        setError(`Falha ao excluir clientes: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Edição em Massa</h2>
      <p className="text-sm text-gray-600 mb-4">
        Editando {selectedClients.length} cliente{selectedClients.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="updateStatus"
            checked={fieldsToUpdate.status}
            onCheckedChange={(checked) => setFieldsToUpdate((prev) => ({ ...prev, status: checked as boolean }))}
          />
          <Label htmlFor="updateStatus">Atualizar Status</Label>
        </div>
        {fieldsToUpdate.status && (
          <Select onValueChange={handleStatusChange} value={formData.status}>
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
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="updateEmpresa"
            checked={fieldsToUpdate.empresa}
            onCheckedChange={(checked) => setFieldsToUpdate((prev) => ({ ...prev, empresa: checked as boolean }))}
          />
          <Label htmlFor="updateEmpresa">Atualizar Empresa</Label>
        </div>
        {fieldsToUpdate.empresa && (
          <Input
            id="empresa"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            placeholder="Nova empresa"
          />
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="updateEndereco"
            checked={fieldsToUpdate.endereco}
            onCheckedChange={(checked) => setFieldsToUpdate((prev) => ({ ...prev, endereco: checked as boolean }))}
          />
          <Label htmlFor="updateEndereco">Atualizar Endereço</Label>
        </div>
        {fieldsToUpdate.endereco && (
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Novo endereço"
          />
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Atualizando..." : "Atualizar Clientes"}
        </Button>
        <Button type="button" variant="destructive" onClick={handleBulkDelete} disabled={isLoading}>
          {isLoading ? "Excluindo..." : `Excluir ${selectedClients.length} Cliente(s)`}
        </Button>
      </div>
    </form>
  )
}

