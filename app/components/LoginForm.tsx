"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "../lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type React from "react"

interface LoginFormProps {
  onSwitchToRegister: () => void
  setIsLoading: (isLoading: boolean) => void
}

export default function LoginForm({ onSwitchToRegister, setIsLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const user = await loginUser(email, password)
      const redirectPath = user.userType === "agency" ? "/agency/home" : "/client/home"
      router.push(redirectPath)
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
      <p className="text-center text-sm">
        Ainda não tem uma conta?{" "}
        <button onClick={onSwitchToRegister} className="text-blue-500 hover:underline">
          Cadastre-se aqui
        </button>
      </p>
    </form>
  )
}

