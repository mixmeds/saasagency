"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "../Modal"
import { Upload, X, FileUp, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => Promise<void>
}

const BATCH_SIZE = 100 // Number of records to process at once

export function ImportCSVModal({ isOpen, onClose, onImport }: ImportCSVModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [processedRecords, setProcessedRecords] = useState(0)

  const processCSVInBatches = async (text: string) => {
    try {
      const rows = text.split("\n").filter((row) => row.trim()) // Remove empty lines
      const headers = rows[0].split(",").map((header) => header.trim())
      const dataRows = rows.slice(1)

      setTotalRecords(dataRows.length)
      setProcessedRecords(0)

      // Process in batches
      for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
        const batch = dataRows.slice(i, i + BATCH_SIZE).map((row) => {
          const values = row.split(",")
          return headers.reduce((obj: any, header, index) => {
            obj[header.trim()] = values[index]?.trim() || ""
            return obj
          }, {})
        })

        await onImport(batch)

        setProcessedRecords((prev) => prev + batch.length)
        setProgress(((i + batch.length) / dataRows.length) * 100)
      }

      onClose()
    } catch (err) {
      console.error("Error processing CSV:", err)
      setError("Erro ao processar arquivo CSV. Verifique o formato e tente novamente.")
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setFileName(file.name)
        setError(null)
        setIsLoading(true)
        setProgress(0)

        try {
          const text = await file.text()
          await processCSVInBatches(text)
        } catch (err) {
          setError("Erro ao ler arquivo CSV. Verifique o formato e tente novamente.")
        } finally {
          setIsLoading(false)
        }
      }
    },
    [onImport, onClose, processCSVInBatches],
  ) // Added processCSVInBatches to dependencies

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  const handleClearFile = () => {
    setFileName(null)
    setError(null)
    setProgress(0)
    setProcessedRecords(0)
    setTotalRecords(0)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Importar Clientes (CSV)</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}
            ${fileName ? "bg-gray-50" : ""}
            ${isLoading ? "pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          {fileName ? (
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">{fileName}</span>
              {!isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearFile()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {isDragActive ? (
                    "Solte o arquivo aqui..."
                  ) : (
                    <>
                      Arraste e solte o arquivo CSV aqui, ou
                      <br />
                      <span className="text-primary">clique para selecionar</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400">Apenas arquivos CSV são aceitos</p>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              Processando registros: {processedRecords} de {totalRecords}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button disabled={!fileName || isLoading}>{isLoading ? "Importando..." : "Importar"}</Button>
        </div>
      </div>
    </Modal>
  )
}

