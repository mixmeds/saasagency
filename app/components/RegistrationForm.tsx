"use client"

import { useState } from "react"
import { registerUser } from "../lib/firebase"

interface RegistrationFormProps {
  userType: "agency" | "client"
  onSwitchToLogin: () => void
  setIsLoading: (isLoading: boolean) => void
}

function formatCNPJ(value: string) {
  const cnpjMask = value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")

  return cnpjMask
}

export default function RegistrationForm({ userType, onSwitchToLogin, setIsLoading }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cnpj: "",
    noCnpj: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (name === "cnpj") {
      setFormData((prev) => ({
        ...prev,
        [name]: formatCNPJ(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      await registerUser(formData.email, formData.password, formData.name, userType)
      setSuccessMessage("Cadastro realizado com sucesso!")
      setTimeout(() => {
        setSuccessMessage(null)
        onSwitchToLogin()
      }, 3000)
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}
      {userType === "agency" && (
        <>
          <div>
            <label htmlFor="name" className="block mb-1">
              Nome da Agência
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="cnpj" className="block mb-1">
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              disabled={formData.noCnpj}
              required={!formData.noCnpj}
              maxLength={18}
            />
          </div>
          <div>
            <label className="flex items-center">
              <input type="checkbox" name="noCnpj" checked={formData.noCnpj} onChange={handleChange} className="mr-2" />
              Não tenho CNPJ
            </label>
          </div>
        </>
      )}
      {userType === "client" && (
        <div>
          <label htmlFor="name" className="block mb-1">
            Nome
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-1">
          Senha
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block mb-1">
          Confirmar Senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
        Cadastrar
      </button>
      <p className="text-center text-sm">
        Já tem uma conta?{" "}
        <button onClick={onSwitchToLogin} className="text-blue-500 hover:underline">
          Faça login aqui
        </button>
      </p>
    </form>
  )
}

