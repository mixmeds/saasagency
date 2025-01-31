"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import LoginForm from "./LoginForm"
import RegistrationForm from "./RegistrationForm"
import UserTypeToggle from "./UserTypeToggle"
import ScrollIndicator from "./ScrollIndicator"

const setBodyScroll = (enable: boolean) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = enable ? "auto" : "hidden"
  }
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState<"agency" | "client">("client")
  const [isLoading, setIsLoading] = useState(false)
  const [mountModal, setMountModal] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMountModal(true)
    } else {
      const timer = setTimeout(() => setMountModal(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const checkScroll = () => {
      if (modalContentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = modalContentRef.current
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight)
      }
    }

    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setBodyScroll(false)
    } else {
      setBodyScroll(true)
    }

    return () => {
      setBodyScroll(true)
    }
  }, [isOpen])

  if (!mountModal) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg w-full max-w-md relative"
          >
            <div className="p-8">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6">{isLogin ? "Login" : "Cadastro"}</h2>
            </div>
            <div
              ref={modalContentRef}
              className="max-h-[60vh] overflow-y-auto px-8 pb-8"
              onScroll={() => {
                if (modalContentRef.current) {
                  const { scrollHeight, clientHeight, scrollTop } = modalContentRef.current
                  setShowScrollIndicator(scrollTop < scrollHeight - clientHeight)
                }
              }}
            >
              {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} setIsLoading={setIsLoading} />
              ) : (
                <>
                  <UserTypeToggle userType={userType} setUserType={setUserType} />
                  <RegistrationForm
                    userType={userType}
                    onSwitchToLogin={() => setIsLogin(true)}
                    setIsLoading={setIsLoading}
                  />
                </>
              )}
            </div>
            {showScrollIndicator && <ScrollIndicator />}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

