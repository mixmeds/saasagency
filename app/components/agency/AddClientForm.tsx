"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addDoc, collection } from "firebase/firestore"
import { db, auth } from "@/app/lib/firebase"

interface AddClientFormProps {
  onClientAdded: () => void
  onCancel: () => void
}

export function AddClientForm({ onClientAdded, onCancel }: AddClientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    website: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      const newClient = {
        ...formData,
        agencyId: user.uid,
        createdAt: new Date(),
        activeCampaigns: 0,
        totalSpend: 0,
      }

      await addDoc(collection(db, "clients"), newClient)
      onClientAdded()
    } catch (err) {
      console.error("Error adding new client:", err)
      setError("Failed to add new client. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Cliente</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" value={formData.website} onChange={handleChange} />
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

