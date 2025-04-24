"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export function FileUploader({ onFilesSelected, accept = "*", multiple = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files)
      onFilesSelected(filesArray)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      onFilesSelected(filesArray)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragging ? "border-[#FFEE10] bg-[#FFEE10]/10" : "border-muted-foreground/25 hover:border-muted-foreground/50",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
      />

      <div className="flex flex-col items-center gap-2">
        <div className="p-3 rounded-full bg-muted">
          <Upload className="h-6 w-6 text-[#FFEE10]" />
        </div>
        <h3 className="text-lg font-semibold">
          {isDragging ? "Déposez les fichiers ici" : "Glissez-déposez ou cliquez pour sélectionner"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {multiple ? "Vous pouvez sélectionner plusieurs fichiers" : "Sélectionnez un fichier"}
        </p>
      </div>
    </div>
  )
}

