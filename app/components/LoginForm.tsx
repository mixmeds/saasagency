"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "../lib/firebase"
import WelcomeNotification from "./WelcomeNotification"

interface LoginFormProps {
  onSwitchToRegister: () => void
  setIsLoading: (isLoading: boolean) => void
}

export default function LoginForm({ onSwitchToRegister, setIsLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false)
  const [userData, setUserData] = useState<{ name: string; userType: "agency" | "client" } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = await loginUser(email, password)
      setUserData({
        name: user.name,
        userType: user.userType,
      })
      setShowWelcomeNotification(true)

      // Redirect based on user type immediately
      const redirectPath = user.userType === "agency" ? "/agency/home" : "/client/home"
      router.push(redirectPath)
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Entrar
        </button>
        <p className="text-center text-sm">
          Ainda não tem uma conta?{" "}
          <button onClick={onSwitchToRegister} className="text-blue-500 hover:underline">
            Cadastre-se aqui
          </button>
        </p>
      </form>
      {showWelcomeNotification && userData && (
        <WelcomeNotification
          userName={userData.name}
          userType={userData.userType}
          onClose={() => setShowWelcomeNotification(false)}
        />
      )}
    </>
  )
}

