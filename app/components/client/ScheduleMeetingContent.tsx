"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ScheduleMeetingContent() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("")
  const [topic, setTopic] = useState<string>("")

  const handleScheduleMeeting = () => {
    // Implement logic to schedule the meeting
    console.log("Meeting scheduled:", { date, time, topic })
    // You would typically send this data to your backend
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agendar Reunião</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nova Reunião</CardTitle>
          <CardDescription>Agende uma reunião com nossa equipe de marketing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Select onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Tópico da Reunião</Label>
            <Input
              id="topic"
              placeholder="Ex: Revisão de Campanha, Planejamento Estratégico"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleScheduleMeeting}>Agendar Reunião</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

