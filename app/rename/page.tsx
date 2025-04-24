"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUploader } from "@/components/file-uploader"
import { ImagePreview } from "@/components/image-preview"
import { Download, Hash, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RenamePage() {
  const [files, setFiles] = useState<File[]>([])
  const [renamedFiles, setRenamedFiles] = useState<{ file: File; url: string; originalName: string }[]>([])
  const [baseFileName, setBaseFileName] = useState("image")
  const [addCounter, setAddCounter] = useState(true)
  const [counterStart, setCounterStart] = useState(1)
  const [counterPadding, setCounterPadding] = useState(2)
  const [extension, setExtension] = useState("keep")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setRenamedFiles([])
  }

  const renameFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const renamed: { file: File; url: string; originalName: string }[] = []

    files.forEach((file, index) => {
      try {
        // Get file extension
        const originalExt = file.name.split(".").pop() || ""
        let newExt = originalExt

        if (extension !== "keep") {
          newExt = extension
        }

        // Create new filename
        let newName = baseFileName

        if (addCounter) {
          const counter = counterStart + index
          const paddedCounter = counter.toString().padStart(counterPadding, "0")
          newName += `_${paddedCounter}`
        }

        newName += `.${newExt}`

        // Create a new file with the new name
        const renamedFile = new File([file], newName, { type: file.type })

        renamed.push({
          file: renamedFile,
          url: URL.createObjectURL(file),
          originalName: file.name,
        })
      } catch (error) {
        console.error("Error renaming file:", error)
      }
    })

    setRenamedFiles(renamed)
    setIsProcessing(false)
  }

  const downloadAll = () => {
    renamedFiles.forEach(({ file, url }) => {
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
    setRenamedFiles([])
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Renommage de fichiers</h1>
          <p className="text-muted-foreground">Sélectionnez un ou plusieurs fichiers et définissez un modèle de nom</p>
        </div>

        <FileUploader onFilesSelected={handleFilesSelected} accept="image/*" multiple={true} />

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseFileName">Nom de base</Label>
                <Input
                  id="baseFileName"
                  value={baseFileName}
                  onChange={(e) => setBaseFileName(e.target.value)}
                  placeholder="ex: projet_image"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extension">Extension</Label>
                <Select value={extension} onValueChange={setExtension}>
                  <SelectTrigger id="extension">
                    <SelectValue placeholder="Choisir une extension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Conserver l&apos;originale</SelectItem>
                    <SelectItem value="jpg">jpg</SelectItem>
                    <SelectItem value="jpeg">jpeg</SelectItem>
                    <SelectItem value="png">png</SelectItem>
                    <SelectItem value="webp">webp</SelectItem>
                    <SelectItem value="gif">gif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="add-counter" checked={addCounter} onCheckedChange={setAddCounter} />
              <Label htmlFor="add-counter" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Ajouter un compteur
              </Label>
            </div>

            {addCounter && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="counterStart">Commencer à</Label>
                  <Input
                    id="counterStart"
                    type="number"
                    min={0}
                    value={counterStart}
                    onChange={(e) => setCounterStart(Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counterPadding">Nombre de chiffres</Label>
                  <Input
                    id="counterPadding"
                    type="number"
                    min={1}
                    max={10}
                    value={counterPadding}
                    onChange={(e) => setCounterPadding(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={renameFiles}
                className="bg-[#FFEE10] text-black hover:bg-[#FFEE10]/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Renommage en cours..." : "Renommer les fichiers"}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer tout
              </Button>
              {renamedFiles.length > 0 && (
                <Button variant="outline" onClick={downloadAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger tout
                </Button>
              )}
            </div>

            {renamedFiles.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Fichiers renommés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renamedFiles.map(({ file, url, originalName }, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <ImagePreview file={file} url={url} showDownload />
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">Nom original: {originalName}</p>
                        <p className="font-medium truncate">Nouveau nom: {file.name}</p>
                      </div>
                    </div>
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

