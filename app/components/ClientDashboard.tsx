"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  BarChart3,
  LogOut,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import LoadingOverlay from "./LoadingOverlay"
import { DashboardContent } from "./client/DashboardContent"
import { CampaignsContent } from "./client/CampaignsContent"
import { ReportsContent } from "./client/ReportsContent"
import { ScheduleMeetingContent } from "./client/ScheduleMeetingContent"
import { SettingsContent } from "./client/SettingsContent"

interface ClientData {
  name: string
  activeCampaigns: number
  nextMeeting: string
  currentROI: number
}

interface Campaign {
  id: string
  name: string
  status: string
  progress: number
  metrics: {
    reach: string
    engagement: string
    conversion: string
  }
}

interface Meeting {
  id: string
  title: string
  date: string
  status: "confirmed" | "pending"
}

export function ClientDashboard() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Added state for error messages
  const router = useRouter()

  useEffect(() => {
    console.log("ClientDashboard mounted")
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User authenticated:", user.uid)
        fetchClientData()
      } else {
        console.log("No authenticated user, redirecting to home")
        router.push("/")
      }
    })

    return () => {
      console.log("ClientDashboard unmounted")
      unsubscribe()
    }
  }, [router])

  const fetchClientData = async () => {
    console.log("Fetching client data")
    setIsDataLoading(true)
    setErrorMessage(null)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user")
      }
      console.log("Fetching data for user:", user.uid)

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        throw new Error("User document does not exist")
      }
      const userData = userDoc.data()
      console.log("User data fetched:", userData)

      if (userData.userType !== "client") {
        throw new Error("User is not a client")
      }

      setClientData({
        name: userData.name,
        activeCampaigns: userData.activeCampaigns || 0,
        nextMeeting: userData.nextMeeting || "Não agendada",
        currentROI: userData.currentROI || 0,
      })

      // Fetch campaigns
      console.log("Fetching campaigns")
      const campaignsQuery = query(
        collection(db, "campaigns"),
        where("clientId", "==", user.uid),
        where("status", "==", "active"),
      )
      const campaignsSnapshot = await getDocs(campaignsQuery)
      const campaignData = campaignsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Campaign[]
      console.log("Campaigns fetched:", campaignData)
      setCampaigns(campaignData)

      // Fetch upcoming meetings
      console.log("Fetching meetings")
      try {
        const meetingsQuery = query(
          collection(db, "meetings"),
          where("clientId", "==", user.uid),
          where("date", ">=", new Date()),
          orderBy("date"),
          limit(5),
        )
        const meetingsSnapshot = await getDocs(meetingsQuery)
        const meetingsData = meetingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Meeting[]
        console.log("Meetings fetched:", meetingsData)
        setUpcomingMeetings(meetingsData)
      } catch (error: any) {
        console.error("Error fetching meetings:", error)
        if (error.code === "failed-precondition") {
          setErrorMessage("É necessário criar um índice para as reuniões. Por favor, contate o administrador.")
        } else {
          setUpcomingMeetings([])
        }
      }
    } catch (error: any) {
      console.error("Error fetching client data:", error)
      if (error.code === "permission-denied") {
        setErrorMessage("Permissão negada. Por favor, verifique suas credenciais e tente novamente.")
      } else if (error.message === "User is not a client") {
        setErrorMessage("Acesso negado. Esta conta não é uma conta de cliente.")
      } else {
        setErrorMessage("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.")
      }
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
    { id: "campaigns", icon: FileText, label: "Campanhas" },
    { id: "reports", icon: BarChart3, label: "Relatórios" },
    { id: "calendar", icon: Calendar, label: "Agendar Reunião" },
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
              <span className="font-bold text-xl">ClientHub</span>
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
                onClick={() => {
                  setActiveTab(item.id)
                }}
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
                placeholder="Pesquisar campanhas, relatórios..."
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
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
              {clientData ? clientData.name.charAt(0).toUpperCase() : "C"}
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
          {activeTab === "campaigns" && <CampaignsContent />}
          {activeTab === "reports" && <ReportsContent />}
          {activeTab === "calendar" && <ScheduleMeetingContent />}
          {activeTab === "settings" && <SettingsContent />}
        </main>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Agendar Nova Reunião</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Reunião</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Revisão de Campanha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Detalhes sobre a reunião..."
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

