'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { ArchivoPendiente, EstadoArchivo } from '../hooks/useGaleria'
import { claveArchivo, formatBytes } from '../lib/archivo'

interface UploadQueueProps {
  items: ArchivoPendiente[]
  estados: Record<string, EstadoArchivo>
  onRemove: (index: number) => void
  onTituloChange: (index: number, titulo: string) => void
  disabled?: boolean
}

export function UploadQueue({
  items,
  estados,
  onRemove,
  onTituloChange,
  disabled = false,
}: UploadQueueProps) {
  if (items.length === 0) return null
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <QueueItem
          key={claveArchivo(item.file)}
          item={item}
          estado={estados[claveArchivo(item.file)] ?? 'pendiente'}
          disabled={disabled}
          onRemove={() => onRemove(i)}
          onTituloChange={(titulo) => onTituloChange(i, titulo)}
        />
      ))}
    </div>
  )
}

interface QueueItemProps {
  item: ArchivoPendiente
  estado: EstadoArchivo
  disabled: boolean
  onRemove: () => void
  onTituloChange: (titulo: string) => void
}

function QueueItem({
  item,
  estado,
  disabled,
  onRemove,
  onTituloChange,
}: QueueItemProps) {
  const { file, titulo } = item
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="flex items-start gap-2 rounded-lg border border-brand-azul/30 bg-brand-azul/5 p-2">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
        {preview && (
          <Image
            src={preview}
            alt={file.name}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <Input
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          disabled={disabled}
          placeholder="Título (opcional)"
          aria-label={`Título de ${file.name}`}
          className="h-7 text-xs"
        />
        <p className="truncate text-[11px] text-muted-foreground">
          {file.name} · {formatBytes(file.size)}
        </p>
      </div>
      <EstadoIcono estado={estado} />
      {estado !== 'subiendo' && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar ${file.name}`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function EstadoIcono({ estado }: { estado: EstadoArchivo }) {
  if (estado === 'subiendo') {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-azul" />
  }
  if (estado === 'ok') {
    return <Check className="h-4 w-4 shrink-0 text-emerald-500" />
  }
  if (estado === 'error') {
    return <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
  }
  return null
}
