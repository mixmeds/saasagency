"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageSquare,
  LogOut,
  UserPlus,
  Briefcase,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import LoadingOverlay from "./LoadingOverlay"
import { ClientsContent } from "./agency/ClientsContent"
import { CampaignsContent } from "./agency/CampaignsContent"
import { AnalyticsContent } from "./agency/AnalyticsContent"
import { SettingsContent } from "./agency/SettingsContent"
import { DashboardContent } from "./agency/DashboardContent"
import { CollaboratorsContent } from "./agency/CollaboratorsContent"
import { ProjectsContent } from "./agency/ProjectsContent"

interface AgencyData {
  name: string
  activeClients: number
  activeCampaigns: number
  averageROI: number
}

export function AgencyDashboard() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Removed: console.log("Active Tab:", activeTab)
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().userType === "agency") {
          fetchAgencyData()
        } else {
          setErrorMessage("Acesso negado. Esta conta não é uma conta de agência.")
          router.push("/")
        }
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchAgencyData = async (retryCount = 0) => {
    setIsDataLoading(true)
    setErrorMessage(null)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user")
      }

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        throw new Error("User document does not exist")
      }
      const userData = userDoc.data()

      if (userData.userType !== "agency") {
        throw new Error("User is not an agency")
      }

      // For now, we'll set placeholder values for activeClients, activeCampaigns, and averageROI
      setAgencyData({
        name: userData.name,
        activeClients: 0,
        activeCampaigns: 0,
        averageROI: 0,
      })

      // Clear recent activity for now
    } catch (error: any) {
      console.error("Erro ao carregar dados da agência:", error)
      if (error.code === "permission-denied") {
        if (retryCount < 3) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})...`)
          setTimeout(() => fetchAgencyData(retryCount + 1), 2000)
          return
        }
        setErrorMessage("Permissão negada. Por favor, verifique suas credenciais e tente novamente.")
      } else if (error.message === "User is not an agency") {
        setErrorMessage("Acesso negado. Esta conta não é uma conta de agência.")
      } else {
        setErrorMessage("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.")
      }
      // Set default values
      setAgencyData({
        name: "N/A",
        activeClients: 0,
        activeCampaigns: 0,
        averageROI: 0,
      })
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "clients", icon: Users, label: "Clientes" },
    { id: "projects", icon: Briefcase, label: "Projetos" },
    { id: "campaigns", icon: FileText, label: "Campanhas" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "collaborators", icon: UserPlus, label: "Colaboradores" },
    { id: "settings", icon: Settings, label: "Configurações" },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white h-full shadow-lg transition-all duration-300 flex flex-col ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Area */}
        <div className="p-4 flex items-center justify-between border-b">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <Menu className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">AgencyHub</span>
            </div>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg hover:bg-gray-100">
            {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 flex flex-col justify-between">
          <div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)} // Updated onClick handler
                className={`w-full flex items-center p-4 hover:bg-blue-50 transition-colors ${
                  activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isExpanded ? "mr-3" : "mx-auto"}`} />
                {isExpanded && <span>{item.label}</span>}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className={`h-5 w-5 ${isExpanded ? "mr-3" : "mx-auto"}`} />
            {isExpanded && <span>Sair</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white h-16 border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1"></div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {agencyData ? agencyData.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "clients" && <ClientsContent />}
          {activeTab === "projects" && <ProjectsContent />}
          {activeTab === "campaigns" && <CampaignsContent />}
          {activeTab === "analytics" && <AnalyticsContent />}
          {activeTab === "collaborators" && <CollaboratorsContent />}
          {activeTab === "settings" && <SettingsContent />}
        </main>
      </div>
      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

