"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { ClientDashboard } from "@/app/components/ClientDashboard"

export default function ClientHome() {
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().userType === "client") {
          setUserName(userDoc.data().name)
        } else {
          router.push("/")
        }
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  if (!userName) {
    return <div>Loading...</div>
  }

  return <ClientDashboard />
}

