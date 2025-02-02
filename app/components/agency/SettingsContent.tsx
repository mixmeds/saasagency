"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { auth, db } from "@/app/lib/firebase"
import { getDoc, doc, updateDoc } from "firebase/firestore"

type UserData = {
  uid: string
  name: string
  email: string
  // ... other user data fields
}

export function SettingsContent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }
      }
    }
    fetchUserData()
  }, [])

  const handleSaveProfile = async () => {
    if (userData) {
      try {
        await updateDoc(doc(db, "users", userData.uid), {
          name: userData.name,
          email: userData.email,
        })
        console.log("Perfil salvo:", { name: userData.name, email: userData.email })
      } catch (error) {
        console.error("Erro ao salvar perfil:", error)
      }
    }
  }

  const handleSaveNotifications = () => {
    console.log("Configurações de notificação salvas:", notifications)
  }

  if (!userData) {
    return <div>Carregando...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize as informações do seu perfil aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Nome da Agência</Label>
                <Input
                  id="agencyName"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha como deseja receber notificações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Notificações por Email</Label>
                <Switch
                  id="emailNotifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Notificações Push</Label>
                <Switch
                  id="pushNotifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications">Notificações SMS</Label>
                <Switch
                  id="smsNotifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Faturamento</CardTitle>
              <CardDescription>Gerencie suas informações de pagamento e faturamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de faturamento em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

