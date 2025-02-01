"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function SettingsContent() {
  const [agencyName, setAgencyName] = useState("Minha Agência")
  const [email, setEmail] = useState("contato@minhaagencia.com")
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const handleSaveProfile = () => {
    // Implementar lógica para salvar o perfil
    console.log("Perfil salvo:", { agencyName, email })
  }

  const handleSaveNotifications = () => {
    // Implementar lógica para salvar as configurações de notificação
    console.log("Configurações de notificação salvas:", notifications)
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
                <Input id="agencyName" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
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

