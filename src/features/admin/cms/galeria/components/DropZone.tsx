'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length) onFiles(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
        dragOver
          ? 'border-brand-azul bg-brand-azul/5'
          : 'border-muted-foreground/30 hover:border-brand-azul hover:bg-muted/50'
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-brand-azul/10 flex items-center justify-center">
        <Upload className="h-6 w-6 text-brand-azul" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          Arrastra imágenes aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, WebP · Múltiples archivos permitidos
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
