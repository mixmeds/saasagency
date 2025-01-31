"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import AuthModal from "./AuthModal"

export default function Header() {
  const [isSticky, setIsSticky] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSticky ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Logo</div>
          <ul className="flex space-x-6">
            <li>
              <button onClick={() => scrollTo("home")} className="hover:text-blue-500 transition-colors">
                Início
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("about")} className="hover:text-blue-500 transition-colors">
                Quem Somos
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("pricing")} className="hover:text-blue-500 transition-colors">
                Planos
              </button>
            </li>
          </ul>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <User size={18} />
            <span>Login</span>
          </button>
        </nav>
      </header>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

