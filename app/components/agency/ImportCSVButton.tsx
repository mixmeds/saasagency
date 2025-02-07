import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"
import { useRef } from "react"
import type React from "react" // Added import for React

interface ImportCSVButtonProps {
  onImport: (file: File) => void
}

export function ImportCSVButton({ onImport }: ImportCSVButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImport(file)
    }
  }

  return (
    <>
      <Button onClick={handleClick}>
        <FileUp className="mr-2 h-4 w-4" /> Importar CSV
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: "none" }} />
    </>
  )
}

