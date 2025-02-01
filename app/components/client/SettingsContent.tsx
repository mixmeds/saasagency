"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function SettingsContent() {
  const [name, setName] = useState("João Silva")
  const [email, setEmail] = useState("joao.silva@example.com")
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const handleSaveProfile = () => {
    // Implement logic to save profile
    console.log("Perfil salvo:", { name, email })
  }

  const handleSaveNotifications = () => {
    // Implement logic to save notification settings
    console.log("Configurações de notificação salvas:", notifications)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
              <CardDescription>Gerencie suas configurações de privacidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de privacidade em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

