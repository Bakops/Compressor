"use client"

import { FileUploader } from "@/components/file-uploader"
import { ImagePreview } from "@/components/image-preview"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download, Trash2 } from "lucide-react"
import { useState } from "react"

export default function CompressionPage() {
  const [files, setFiles] = useState<File[]>([])
  const [compressedFiles, setCompressedFiles] = useState<{ file: File; url: string }[]>([])
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setCompressedFiles([])
  }

  const compressImages = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const compressed: { file: File; url: string }[] = []

    for (const file of files) {
      try {        
        // Get file extension and mime type
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
        const mimeType = file.type

        // Create an image from the file
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise((resolve) => {
          img.onload = resolve
        })

        // Create a canvas to compress the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Set dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw and compress
        ctx?.drawImage(img, 0, 0)

        const outputMimeType = mimeType || "image/jpeg"
        const outputExtension = fileExtension || "jpg"

        // Convert to blob with quality setting
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob as Blob), outputMimeType, quality / 100)
        })

        // Create a new file with preserved extension
        const compressedFile = new File(
          [blob], 
          file.name.replace(/\.[^/.]+$/, "") + `_compressed.${outputExtension}`, 
          { type: outputMimeType }
        )

        compressed.push({
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
        })
      } catch (error) {
        console.error("Error compressing image:", error)
      }
    }

    setCompressedFiles(compressed)
    setIsProcessing(false)
  }

  const downloadAll = () => {
    compressedFiles.forEach(({ file, url }) => {
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
    setCompressedFiles([])
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compression d&apos;images</h1>
          <p className="text-muted-foreground">
            Sélectionnez une ou plusieurs images et ajustez le niveau de compression
          </p>
        </div>

        <FileUploader onFilesSelected={handleFilesSelected} accept="image/*" multiple={true} />

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="quality">Qualité de compression: {quality}%</Label>
                <span className="text-sm text-muted-foreground">
                  {quality < 30 ? "Forte compression" : quality < 70 ? "Compression moyenne" : "Compression légère"}
                </span>
              </div>
              <Slider
                id="quality"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={compressImages}
                className="bg-[#FFEE10] text-black hover:bg-[#FFEE10]/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Compression en cours..." : "Compresser les images"}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer tout
              </Button>
              {compressedFiles.length > 0 && (
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

            {compressedFiles.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Images compressées</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compressedFiles.map(({ file, url }, index) => (
                    <ImagePreview
                      key={`compressed-${index}`}
                      file={file}
                      url={url}
                      label={`Compressé (${Math.round(file.size / 1024)} KB)`}
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

