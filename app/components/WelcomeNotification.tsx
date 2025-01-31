"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

interface WelcomeNotificationProps {
  userName: string
  userType: "agency" | "client"
  onClose: () => void
}

export default function WelcomeNotification({ userName, userType, onClose }: WelcomeNotificationProps) {
  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-6 max-w-sm z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bem-vindo, {userName}!</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <p className="text-gray-700 mb-2">Status: Login realizado com sucesso.</p>
      <p className="text-gray-700">Tipo de conta: {userType === "agency" ? "Agência" : "Cliente"}</p>
    </motion.div>
  )
}

