import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Client {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  status: "Potencial" | "Em negociação" | "Fechado" | "Perdido"
}

interface ClientCardProps {
  client: Client
  onSelect: () => void
}

export function ClientCard({ client, onSelect }: ClientCardProps) {
  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "Potencial":
        return "bg-blue-100 text-blue-800"
      case "Em negociação":
        return "bg-yellow-100 text-yellow-800"
      case "Fechado":
        return "bg-green-100 text-green-800"
      case "Perdido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{client.nome}</span>
          <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{client.email}</p>
        <p className="text-sm text-gray-600">{client.telefone}</p>
        <p className="text-sm font-medium mt-2">{client.empresa}</p>
      </CardContent>
    </Card>
  )
}

