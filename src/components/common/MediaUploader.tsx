'use client'

import { useRef, useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/media'
import type { CarpetaMedia } from '@/services/media.service'
import type { MediaValue } from '@/types/media.types'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

const ASPECT_CLASSES: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3':  'aspect-[4/3]',
  '1:1':  'aspect-square',
  libre:  '',
}

interface MediaUploaderProps {
  value:        MediaValue | null
  onChange:     (value: MediaValue | null) => void
  carpeta:      CarpetaMedia
  accept?:      string
  maxMb?:       number
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'libre'
  placeholder?: string
  className?:   string
  disabled?:    boolean
  uploading?:   boolean
}

export function MediaUploader({
  value,
  onChange,
  carpeta: _carpeta,
  accept      = 'image/*',
  maxMb       = 10,
  aspectRatio = 'libre',
  placeholder = 'Arrastra una imagen o haz clic para seleccionar',
  className,
  disabled  = false,
  uploading = false,
}: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const aspectClass             = ASPECT_CLASSES[aspectRatio] ?? ''

  useEffect(() => {}, [value])

  function procesarArchivo(file: File) {
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`El archivo supera el límite de ${maxMb} MB`)
      return
    }
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast.error('Solo se permiten imágenes PNG, JPG o WebP')
      return
    }
    if (value?.esLocal && value.url.startsWith('blob:')) {
      URL.revokeObjectURL(value.url)
    }
    const blobUrl = URL.createObjectURL(file)
    onChange({ url: blobUrl, file, esLocal: true })
  }

  function handleEliminar() {
    if (value?.esLocal && value.url.startsWith('blob:')) {
      URL.revokeObjectURL(value.url)
    }
    onChange(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) procesarArchivo(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) procesarArchivo(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className={cn('relative rounded-xl overflow-hidden border border-border bg-muted', aspectClass)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
          />

          {value.esLocal && !uploading && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Sin guardar
            </span>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 rounded-full border-2 border-brand-azul border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-brand-azul">Guardando...</p>
              </div>
            </div>
          )}

          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="h-7 px-2 rounded-md bg-white/90 hover:bg-white text-xs font-medium shadow-sm border border-border/60 transition-colors disabled:opacity-50"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={disabled}
                className="h-7 w-7 rounded-md bg-white/90 hover:bg-destructive hover:text-white flex items-center justify-center shadow-sm border border-border/60 transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {value.file && (
          <p className="text-[11px] text-gray-400 truncate">
            {value.file.name} — {formatBytes(value.file.size)}
          </p>
        )}

        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors',
        disabled
          ? 'border-muted-foreground/20 bg-muted/30 cursor-not-allowed opacity-60'
          : dragOver
            ? 'border-brand-azul bg-brand-azul/5 cursor-pointer'
            : 'border-muted-foreground/30 hover:border-brand-azul hover:bg-muted/50 cursor-pointer',
        aspectClass,
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-brand-azul/10 flex items-center justify-center">
        <Upload className="h-5 w-5 text-brand-azul" />
      </div>
      <p className="text-sm text-center text-muted-foreground">{placeholder}</p>
      <p className="text-xs text-muted-foreground/60">PNG, JPG, WebP · Máx {maxMb} MB</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}
