import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

interface Client {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  endereco: string
  status: string
  documento: string
}

interface ExportCSVButtonProps {
  clients: Client[]
}

export function ExportCSVButton({ clients }: ExportCSVButtonProps) {
  const convertToCSV = (clients: Client[]) => {
    const headers = ["Nome", "Email", "Telefone", "Empresa", "Endereço", "Status", "Documento"]
    const rows = clients.map((client) => [
      client.nome,
      client.email,
      client.telefone,
      client.empresa,
      client.endereco,
      client.status,
      client.documento,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    console.log("CSV Content:", csvContent) // Log para debug
    return csvContent
  }

  const downloadCSV = (csvContent: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    console.log("Blob URL:", url) // Log para debug

    try {
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "clientes.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erro ao fazer download:", error)
      // Fallback: abrir o conteúdo CSV em uma nova janela
      window.open(url, "_blank")
    }
  }

  const handleExport = () => {
    console.log("Iniciando exportação CSV")
    const csvContent = convertToCSV(clients)
    downloadCSV(csvContent)
    console.log("Exportação CSV concluída")
  }

  return (
    <Button onClick={handleExport}>
      <FileDown className="mr-2 h-4 w-4" /> Exportar CSV
    </Button>
  )
}

