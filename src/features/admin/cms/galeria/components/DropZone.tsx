'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import {
  ACCEPT_ATTR,
  EXTENSIONES_LABEL,
  MAX_TAMANIO_MB,
} from '../constants/upload'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function DropZone({ onFiles, disabled = false }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function abrir() {
    if (!disabled) inputRef.current?.click()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Subir imágenes"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          abrir()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={abrir}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul ${
        disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'
      } ${
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
          {EXTENSIONES_LABEL} · Hasta {MAX_TAMANIO_MB} MB por imagen
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  )
}
