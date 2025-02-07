import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BulkEditCardProps {
  selectedClients: string[]
  onCancel: () => void
  onEdit: () => void
}

export function BulkEditCard({ selectedClients, onCancel, onEdit }: BulkEditCardProps) {
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-72 shadow-lg">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Edição em Massa</h3>
        <p className="text-sm text-gray-600 mb-4">
          {selectedClients.length} cliente{selectedClients.length !== 1 ? "s" : ""} selecionado
          {selectedClients.length !== 1 ? "s" : ""}
        </p>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onEdit} disabled={selectedClients.length === 0}>
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

