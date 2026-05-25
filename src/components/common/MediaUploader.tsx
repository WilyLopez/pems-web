'use client'

import { useRef, useState, useEffect } from 'react'
import { Upload, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { mediaService, CarpetaMedia } from '@/services/media.service'

type Estado = 'vacio' | 'subiendo' | 'completado' | 'error'

interface MediaUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  carpeta: CarpetaMedia
  accept?: string
  maxMb?: number
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'libre'
  placeholder?: string
  className?: string
}

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'application/pdf',
]

const ASPECT_CLASSES: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  libre: '',
}

export function MediaUploader({
  value,
  onChange,
  carpeta,
  accept = 'image/*',
  maxMb = 10,
  aspectRatio = 'libre',
  placeholder = 'Arrastra una imagen o haz clic para seleccionar',
  className,
}: MediaUploaderProps) {
  const [estado, setEstado] = useState<Estado>(value ? 'completado' : 'vacio')
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null)
  const [tamanio, setTamanio] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar estado cuando cambia el valor desde afuera
  useEffect(() => {
    if (value) {
      setEstado('completado')
    } else {
      setEstado('vacio')
      setNombreArchivo(null)
      setTamanio(null)
    }
  }, [value])

  async function procesarArchivo(file: File) {
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`El archivo supera el limite de ${maxMb} MB`)
      return
    }
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast.error(`Tipo de archivo no permitido: ${file.type}`)
      return
    }
    setEstado('subiendo')
    try {
      const response = await mediaService.upload(file, carpeta)
      setNombreArchivo(file.name)
      setTamanio(file.size)
      onChange(response.url)
      setEstado('completado')
    } catch {
      setEstado('error')
      toast.error('No se pudo subir el archivo')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) procesarArchivo(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) procesarArchivo(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleEliminar() {
    if (value) {
      try {
        await mediaService.eliminar(value)
      } catch {
        /* continuar aunque falle el delete remoto */
      }
    }
    onChange(null)
    setNombreArchivo(null)
    setTamanio(null)
    setEstado('vacio')
  }

  const aspectClass = ASPECT_CLASSES[aspectRatio] ?? ''

  if (estado === 'completado' && value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div
          className={cn(
            'relative rounded-xl overflow-hidden border border-border bg-muted',
            aspectClass
          )}
        >
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.opacity = '0.3'
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-7 px-2 rounded-md bg-white/90 hover:bg-white text-xs font-medium shadow-sm border border-border/60 transition-colors"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="h-7 w-7 rounded-md bg-white/90 hover:bg-destructive hover:text-white flex items-center justify-center shadow-sm border border-border/60 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {nombreArchivo && tamanio !== null && (
          <p className="text-[11px] text-gray-400 truncate">
            {nombreArchivo} — {formatBytes(tamanio)}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-center space-y-2">
          <p className="text-sm text-destructive">Error al subir el archivo</p>
          <button
            type="button"
            onClick={() => {
              setEstado('vacio')
              inputRef.current?.click()
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-azul hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => estado !== 'subiendo' && inputRef.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors',
        estado === 'subiendo'
          ? 'border-brand-azul/40 bg-brand-azul/5 cursor-default'
          : dragOver
            ? 'border-brand-azul bg-brand-azul/5 cursor-pointer'
            : 'border-muted-foreground/30 hover:border-brand-azul hover:bg-muted/50 cursor-pointer',
        aspectClass,
        className
      )}
    >
      {estado === 'subiendo' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-brand-azul border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Subiendo...</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-brand-azul/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-brand-azul" />
          </div>
          <p className="text-sm text-center text-muted-foreground">{placeholder}</p>
          <p className="text-xs text-muted-foreground/60">Maximo {maxMb} MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
