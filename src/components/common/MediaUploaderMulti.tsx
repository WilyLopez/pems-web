'use client'

import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CarpetaMedia } from '@/services/media.service'
import { MediaValue } from '@/types/media.types'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

interface MediaUploaderMultiProps {
  values: MediaValue[]
  onChange: (values: MediaValue[]) => void
  carpeta: CarpetaMedia
  maxImagenes?: number
  maxMb?: number
  className?: string
}

export function MediaUploaderMulti({
  values,
  onChange,
  carpeta: _carpeta,
  maxImagenes = 8,
  maxMb = 5,
  className,
}: MediaUploaderMultiProps) {
  const [dragSobre, setDragSobre] = useState<number | null>(null)
  const [dragOrigen, setDragOrigen] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function agregarArchivos(archivos: FileList) {
    const disponibles = maxImagenes - values.length
    const candidatos = Array.from(archivos)
    const validos = candidatos
      .slice(0, disponibles)
      .filter(
        (f) =>
          TIPOS_PERMITIDOS.includes(f.type) && f.size <= maxMb * 1024 * 1024
      )
    const omitidos = candidatos.length - validos.length
    if (omitidos > 0) {
      toast.warning(
        `Se omitieron ${omitidos} archivo${omitidos > 1 ? 's' : ''} por tipo o tamaño`
      )
    }
    const nuevos: MediaValue[] = validos.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
      esLocal: true,
    }))
    onChange([...values, ...nuevos])
  }

  function eliminar(index: number) {
    const item = values[index]
    if (item.esLocal && item.url.startsWith('blob:'))
      URL.revokeObjectURL(item.url)
    onChange(values.filter((_, i) => i !== index))
  }

  function handleDragStart(index: number) {
    setDragOrigen(index)
  }

  function handleDropSobre(destino: number) {
    if (dragOrigen === null || dragOrigen === destino) {
      setDragOrigen(null)
      setDragSobre(null)
      return
    }
    const nuevos = [...values]
    const [item] = nuevos.splice(dragOrigen, 1)
    nuevos.splice(destino, 0, item)
    onChange(nuevos)
    setDragOrigen(null)
    setDragSobre(null)
  }

  function handleChangeFichero(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0)
      agregarArchivos(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const puedeAgregar = values.length < maxImagenes

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-muted-foreground">
        Imágenes ({values.length}/{maxImagenes})
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {values.map((v, i) => (
          <div
            key={v.url}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => {
              e.preventDefault()
              setDragSobre(i)
            }}
            onDragLeave={() => setDragSobre(null)}
            onDrop={(e) => {
              e.preventDefault()
              handleDropSobre(i)
            }}
            className={cn(
              'relative aspect-square rounded-xl overflow-hidden border-2 bg-muted cursor-grab transition-all',
              dragSobre === i && dragOrigen !== i
                ? 'border-brand-azul scale-105'
                : 'border-border'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.url} alt="" className="w-full h-full object-cover" />

            <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </span>

            {v.esLocal && (
              <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded">
                Local
              </span>
            )}

            <button
              type="button"
              onClick={() => eliminar(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {puedeAgregar && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-brand-azul hover:bg-brand-azul/5 flex items-center justify-center transition-colors"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground/60">
        PNG, JPG, WebP · Máx {maxMb} MB por imagen · Arrastra para reordenar
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChangeFichero}
      />
    </div>
  )
}
