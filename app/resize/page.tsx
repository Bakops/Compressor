"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUploader } from "@/components/file-uploader"
import { ImagePreview } from "@/components/image-preview"
import { Download, Lock, Trash2, Unlock } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function ResizePage() {
  const [files, setFiles] = useState<File[]>([])
  const [resizedFiles, setResizedFiles] = useState<{ file: File; url: string }[]>([])
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setResizedFiles([])
  }

  const resizeImages = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const resized: { file: File; url: string }[] = []

    for (const file of files) {
      try {
        // Create an image from the file
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise((resolve) => {
          img.onload = resolve
        })

        // Calculate dimensions
        let newWidth = width
        let newHeight = height

        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height
          if (newWidth / newHeight > aspectRatio) {
            newWidth = Math.round(newHeight * aspectRatio)
          } else {
            newHeight = Math.round(newWidth / aspectRatio)
          }
        }

        // Create a canvas to resize the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Set dimensions
        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and resize
        ctx?.drawImage(img, 0, 0, newWidth, newHeight)

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob as Blob), file.type)
        })

        // Create a new file
        const resizedFile = new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, "") + "_resized" + file.name.match(/\.[^/.]+$/) || ".jpg",
          { type: file.type },
        )

        resized.push({
          file: resizedFile,
          url: URL.createObjectURL(resizedFile),
        })
      } catch (error) {
        console.error("Error resizing image:", error)
      }
    }

    setResizedFiles(resized)
    setIsProcessing(false)
  }

  const downloadAll = () => {
    resizedFiles.forEach(({ file, url }) => {
      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const clearAll = () => {
    setFiles([])
    setResizedFiles([])
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Redimensionnement d&apos;images</h1>
          <p className="text-muted-foreground">
            Sélectionnez une ou plusieurs images et définissez les nouvelles dimensions
          </p>
        </div>

        <FileUploader onFilesSelected={handleFilesSelected} accept="image/*" multiple={true} />

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Largeur (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => setWidth(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Hauteur (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => setHeight(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={setMaintainAspectRatio} />
              <Label htmlFor="aspect-ratio" className="flex items-center gap-2">
                {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                Conserver les proportions
              </Label>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={resizeImages}
                className="bg-[#FFEE10] text-black hover:bg-[#FFEE10]/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Redimensionnement en cours..." : "Redimensionner les images"}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer tout
              </Button>
              {resizedFiles.length > 0 && (
                <Button variant="outline" onClick={downloadAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger tout
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <ImagePreview key={`original-${index}`} file={file} label="Original" />
              ))}
            </div>

            {resizedFiles.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Images redimensionnées</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resizedFiles.map(({ file, url }, index) => (
                    <ImagePreview
                      key={`resized-${index}`}
                      file={file}
                      url={url}
                      label={`${width} × ${height} px`}
                      showDownload
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

