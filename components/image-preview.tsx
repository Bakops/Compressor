"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
  file: File
  url?: string
  label?: string
  showDownload?: boolean
}

export function ImagePreview({ file, url, label, showDownload = false }: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [fileSize, setFileSize] = useState<string>("")

  useEffect(() => {
    // Use provided URL or create one from the file
    const objectUrl = url || URL.createObjectURL(file)
    setImageUrl(objectUrl)

    // Calculate file size
    const size = file.size
    if (size < 1024) {
      setFileSize(`${size} B`)
    } else if (size < 1024 * 1024) {
      setFileSize(`${(size / 1024).toFixed(1)} KB`)
    } else {
      setFileSize(`${(size / (1024 * 1024)).toFixed(1)} MB`)
    }

    // Clean up URL when component unmounts
    return () => {
      if (!url) URL.revokeObjectURL(objectUrl)
    }
  }, [file, url])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-muted">
        <img src={imageUrl || "/placeholder.svg"} alt={file.name} className="w-full h-full object-contain" />
      </div>

      <div className="p-3 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate" title={file.name}>
            {file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name}
          </p>
          {label && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                label === "Original" ? "bg-muted text-muted-foreground" : "bg-[#FFEE10] text-black",
              )}
            >
              {label}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{fileSize}</span>

          {showDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

