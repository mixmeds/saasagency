"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addDoc, collection, serverTimestamp, getDoc, doc } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface AddClientFormProps {
  onClientAdded: () => void
  onCancel: () => void
}

export function AddClientForm({ onClientAdded, onCancel }: AddClientFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefonePrefix: "+55",
    telefone: "",
    empresa: "",
    endereco: "",
    status: "Potencial" as "Potencial" | "Em negociação" | "Fechado" | "Perdido",
    anotacao: "",
    documentType: "cpf" as "cpf" | "cnpj",
    document: "",
    documentDisabled: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as "Potencial" | "Em negociação" | "Fechado" | "Perdido" }))
  }

  const handleDocumentTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, documentType: value as "cpf" | "cnpj", document: "" }))
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedValue = formatDocument(value, formData.documentType)
    setFormData((prev) => ({ ...prev, document: formattedValue }))
  }

  const formatDocument = (value: string, type: "cpf" | "cnpj") => {
    const numbers = value.replace(/\D/g, "")
    if (type === "cpf") {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1")
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists() || userDoc.data().userType !== "agency") {
        throw new Error("Usuário não autorizado a adicionar clientes")
      }

      const newClient = {
        ...formData,
        telefone: `${formData.telefonePrefix}${formData.telefone}`,
        agencyId: user.uid,
        dataCriacao: serverTimestamp(),
        anotacoes: formData.anotacao ? [formData.anotacao] : [],
      }

      const clientDocRef = await addDoc(collection(db, "clients"), newClient)

      // Add recent activity
      await addDoc(collection(db, "recentActivity"), {
        agencyId: user.uid,
        description: `Novo cliente adicionado: ${formData.nome}`,
        timestamp: serverTimestamp(),
      })

      onClientAdded()
    } catch (err: any) {
      console.error("Erro ao adicionar novo cliente:", err)
      if (err.code === "permission-denied") {
        setError("Permissão negada. Verifique se você tem as permissões necessárias para adicionar clientes.")
      } else {
        setError(`Falha ao adicionar novo cliente: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Cliente</Label>
          <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="flex space-x-2">
          <div className="w-1/4">
            <Label htmlFor="telefonePrefix">Prefixo</Label>
            <Input id="telefonePrefix" name="telefonePrefix" value={formData.telefonePrefix} onChange={handleChange} />
          </div>
          <div className="flex-1">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="empresa">Empresa</Label>
          <Input id="empresa" name="empresa" value={formData.empresa} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="documentType">Tipo de Documento</Label>
          <Select onValueChange={handleDocumentTypeChange} defaultValue={formData.documentType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="document">{formData.documentType.toUpperCase()}</Label>
          <Input
            id="document"
            name="document"
            value={formData.document}
            onChange={handleDocumentChange}
            placeholder={`Digite o ${formData.documentType.toUpperCase()}`}
            disabled={formData.documentDisabled}
            required={!formData.documentDisabled}
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="documentDisabled"
              checked={formData.documentDisabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, documentDisabled: checked as boolean, document: "" }))
              }
            />
            <Label htmlFor="documentDisabled">Não informar {formData.documentType.toUpperCase()}</Label>
          </div>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={handleStatusChange} defaultValue={formData.status}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Potencial" className="text-blue-500">
                Potencial
              </SelectItem>
              <SelectItem value="Em negociação" className="text-yellow-500">
                Em negociação
              </SelectItem>
              <SelectItem value="Fechado" className="text-green-500">
                Fechado
              </SelectItem>
              <SelectItem value="Perdido" className="text-red-500">
                Perdido
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="anotacao">Anotação Inicial</Label>
          <Textarea id="anotacao" name="anotacao" value={formData.anotacao} onChange={handleChange} />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adicionando..." : "Adicionar Cliente"}
        </Button>
      </div>
    </form>
  )
}

