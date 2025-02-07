"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { AgencyDashboard } from "@/app/components/AgencyDashboard"
import { ClientsContent } from "@/app/components/agency/ClientsContent"
import { SkeletonText } from "@/app/components/SkeletonLoading"

export default function AgencyHome() {
  const [userName, setUserName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().userType === "agency") {
          setUserName(userDoc.data().name)
          setIsLoading(false)
        } else {
          router.push("/")
        }
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <SkeletonText className="h-8 w-1/4" />
        <SkeletonText className="h-4 w-3/4" />
        <SkeletonText className="h-4 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <SkeletonText className="h-6 w-1/2 mb-2" />
              <SkeletonText className="h-8 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <AgencyDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "clients" && <ClientsContent />}
    </div>
  )
}

