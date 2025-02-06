"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "./Modal"

interface AdvancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (searchParams: AdvancedSearchParams) => void
}

interface AdvancedSearchParams {
  nome: string
  email: string
  telefone: string
  empresa: string
  documento: string
}

export function AdvancedSearchModal({ isOpen, onClose, onSearch }: AdvancedSearchModalProps) {
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    documento: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchParams)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Busca Avançada</h2>
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            value={searchParams.nome}
            onChange={handleChange}
            placeholder="Nome do cliente"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={searchParams.email}
            onChange={handleChange}
            placeholder="Email do cliente"
          />
        </div>
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            value={searchParams.telefone}
            onChange={handleChange}
            placeholder="Telefone do cliente"
          />
        </div>
        <div>
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            id="empresa"
            name="empresa"
            value={searchParams.empresa}
            onChange={handleChange}
            placeholder="Nome da empresa"
          />
        </div>
        <div>
          <Label htmlFor="documento">CPF/CNPJ</Label>
          <Input
            id="documento"
            name="documento"
            value={searchParams.documento}
            onChange={handleChange}
            placeholder="CPF ou CNPJ do cliente"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Buscar</Button>
        </div>
      </form>
    </Modal>
  )
}

