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
  Search,
  MessageSquare,
  LogOut,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import LoadingOverlay from "./LoadingOverlay"
import { Skeleton, SkeletonText } from "./SkeletonLoading"
import { ClientsContent } from "./agency/ClientsContent"
import { CampaignsContent } from "./agency/CampaignsContent"
import { AnalyticsContent } from "./agency/AnalyticsContent"
import { SettingsContent } from "./agency/SettingsContent"

interface AgencyData {
  name: string
  activeClients: number
  activeCampaigns: number
  averageROI: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  time: string
}

export function AgencyDashboard() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      setRecentActivity([])
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
      setRecentActivity([])
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
    { id: "campaigns", icon: FileText, label: "Campanhas" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
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
                onClick={() => setActiveTab(item.id)}
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
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
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
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium">Clientes Ativos</h3>
                {isDataLoading ? (
                  <SkeletonText className="w-24 h-8 mt-2" />
                ) : (
                  <p className="text-3xl font-semibold mt-2">{agencyData?.activeClients || 0}</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                {isDataLoading ? (
                  <SkeletonText className="w-24 h-8 mt-2" />
                ) : (
                  <p className="text-3xl font-semibold mt-2">{agencyData?.activeCampaigns || 0}</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium">ROI Médio</h3>
                {isDataLoading ? (
                  <SkeletonText className="w-24 h-8 mt-2" />
                ) : (
                  <p className="text-3xl font-semibold mt-2">{agencyData?.averageROI || 0}%</p>
                )}
              </div>
            </div>
          )}
          {activeTab === "clients" && <ClientsContent />}
          {activeTab === "campaigns" && <CampaignsContent />}
          {activeTab === "analytics" && <AnalyticsContent />}
          {activeTab === "settings" && <SettingsContent />}
          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {isDataLoading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <SkeletonText className="w-3/4 h-4 mb-2" />
                      <SkeletonText className="w-1/2 h-3" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.description}</h4>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

