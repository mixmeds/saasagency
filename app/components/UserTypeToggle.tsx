"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaBuilding, FaUser } from "react-icons/fa"

interface UserTypeToggleProps {
  userType: "agency" | "client"
  setUserType: (type: "agency" | "client") => void
}

export default function UserTypeToggle({ userType, setUserType }: UserTypeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = (type: "agency" | "client") => {
    if (!isAnimating && type !== userType) {
      setIsAnimating(true)
      setUserType(type)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-200 p-1 rounded-full flex items-center relative">
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-blue-500"
          initial={false}
          animate={{
            x: userType === "agency" ? 0 : "100%",
            width: "50%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        />
        <button
          onClick={() => handleToggle("agency")}
          className={`relative z-10 px-4 py-2 rounded-full flex items-center space-x-2 transition-colors duration-300 ${
            userType === "agency" ? "text-white" : "text-gray-700"
          }`}
          disabled={isAnimating}
        >
          <FaBuilding className="mr-2" />
          <span>Sou Agência</span>
        </button>
        <button
          onClick={() => handleToggle("client")}
          className={`relative z-10 px-4 py-2 rounded-full flex items-center space-x-2 transition-colors duration-300 ${
            userType === "client" ? "text-white" : "text-gray-700"
          }`}
          disabled={isAnimating}
        >
          <FaUser className="mr-2" />
          <span>Sou Cliente</span>
        </button>
      </div>
    </div>
  )
}

