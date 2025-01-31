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
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  LogOut,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import LoadingOverlay from "./LoadingOverlay"
import { Skeleton, SkeletonText } from "./SkeletonLoading"

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
  const router = useRouter()

  useEffect(() => {
    const fetchClientData = async () => {
      setIsDataLoading(true)
      try {
        const user = auth.currentUser
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()

            // Fetch active campaigns
            const campaignsQuery = query(
              collection(db, "campaigns"),
              where("clientId", "==", user.uid),
              where("status", "==", "active"),
            )
            const campaignsSnapshot = await getDocs(campaignsQuery)
            const activeCampaigns = campaignsSnapshot.size

            // Calculate current ROI (assuming ROI is stored in each campaign document)
            let totalROI = 0
            campaignsSnapshot.forEach((doc) => {
              totalROI += doc.data().roi || 0
            })
            const currentROI = activeCampaigns > 0 ? totalROI / activeCampaigns : 0

            // Fetch next meeting
            const meetingsQuery = query(
              collection(db, "meetings"),
              where("clientId", "==", user.uid),
              where("date", ">=", new Date()),
              orderBy("date"),
              limit(1),
            )
            const meetingsSnapshot = await getDocs(meetingsQuery)
            const nextMeeting = meetingsSnapshot.docs[0]?.data().date.toDate().toLocaleString() || "Não agendada"

            setClientData({
              name: userData.name,
              activeCampaigns,
              nextMeeting,
              currentROI: Math.round(currentROI * 100) / 100, // Round to 2 decimal places
            })

            // Fetch campaign details
            const campaignDetails = campaignsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Campaign[]
            setCampaigns(campaignDetails)

            // Fetch upcoming meetings
            const upcomingMeetingsQuery = query(
              collection(db, "meetings"),
              where("clientId", "==", user.uid),
              where("date", ">=", new Date()),
              orderBy("date"),
              limit(5),
            )
            const upcomingMeetingsSnapshot = await getDocs(upcomingMeetingsQuery)
            const upcomingMeetingsData = upcomingMeetingsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Meeting[]
            setUpcomingMeetings(upcomingMeetingsData)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchClientData()
  }, [])

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
    { id: "calendar", icon: Calendar, label: "Agendar Reunião" },
    { id: "reports", icon: FileText, label: "Relatórios" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
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
                  if (item.id === "calendar") {
                    setShowMeetingModal(true)
                  } else {
                    setActiveTab(item.id)
                  }
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {isDataLoading ? (
                <SkeletonText className="w-64 h-8" />
              ) : (
                `Bem-vindo de volta, ${clientData?.name || "Cliente"}!`
              )}
            </h1>
            <p className="text-gray-600">Aqui está o resumo das suas campanhas ativas</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              {isDataLoading ? (
                <SkeletonText className="w-24 h-8" />
              ) : (
                <p className="text-3xl font-semibold">{clientData?.activeCampaigns || 0}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Próxima Reunião</h3>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              {isDataLoading ? (
                <SkeletonText className="w-36 h-6" />
              ) : (
                <p className="text-xl font-semibold">{clientData?.nextMeeting || "Não agendada"}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">ROI Atual</h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              {isDataLoading ? (
                <SkeletonText className="w-24 h-8" />
              ) : (
                <p className="text-3xl font-semibold">{clientData?.currentROI || 0}%</p>
              )}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Campanhas Ativas</h2>
            <div className="space-y-6">
              {isDataLoading ? (
                [...Array(2)].map((_, index) => (
                  <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <SkeletonText className="w-48 h-6" />
                      <SkeletonText className="w-24 h-6" />
                    </div>
                    <Skeleton className="w-full h-2.5 mb-4" />
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i}>
                          <SkeletonText className="w-16 h-4 mb-1" />
                          <SkeletonText className="w-12 h-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="border-b pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-800">{campaign.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </div>
                      <button className="text-blue-600 text-sm hover:underline">Ver detalhes</button>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Alcance</p>
                        <p className="font-semibold">{campaign.metrics.reach}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Engajamento</p>
                        <p className="font-semibold">{campaign.metrics.engagement}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conversão</p>
                        <p className="font-semibold">{campaign.metrics.conversion}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma campanha ativa no momento.</p>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Próximas Reuniões</h2>
              <button
                onClick={() => setShowMeetingModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agendar Reunião
              </button>
            </div>
            <div className="space-y-4">
              {isDataLoading ? (
                [...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <SkeletonText className="w-32 h-5 mb-1" />
                        <SkeletonText className="w-24 h-4" />
                      </div>
                    </div>
                    <SkeletonText className="w-20 h-6" />
                  </div>
                ))
              ) : upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          meeting.status === "confirmed" ? "bg-green-100" : "bg-orange-100"
                        }`}
                      >
                        {meeting.status === "confirmed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-gray-500">{meeting.date}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">Ver detalhes</button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma reunião agendada.</p>
              )}
            </div>
          </div>
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

