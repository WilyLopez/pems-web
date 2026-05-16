'use client'

import { useRef, useState } from 'react'
import { Upload, Star, Trash2, Image as ImageIcon, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useGaleria,
  useSubirImagen,
  useDestacarImagen,
  useEliminarImagen,
} from '@/hooks/useGaleria'
import { ImagenGaleria } from '@/types/galeria.types'

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImageCard({
  imagen,
  onDestacar,
  onEliminar,
}: {
  imagen: ImagenGaleria
  onDestacar: () => void
  onEliminar: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted aspect-square"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagen.url}
        alt={imagen.titulo ?? 'Imagen galería'}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${hover ? 'opacity-100' : 'opacity-0'} flex flex-col justify-between p-2`}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEliminar}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-destructive flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        <div className="space-y-1">
          {imagen.titulo && (
            <p className="text-white text-xs font-medium truncate">
              {imagen.titulo}
            </p>
          )}
          <div className="flex items-center justify-between gap-1">
            <span className="text-white/70 text-xs">
              {formatBytes(imagen.tamanioBytes)}
            </span>
            <button
              type="button"
              onClick={onDestacar}
              className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                imagen.destacada
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-white/20 hover:bg-amber-400'
              }`}
              title={imagen.destacada ? 'Quitar destacado' : 'Destacar'}
            >
              <Star
                className={`h-3 w-3 ${imagen.destacada ? 'text-white fill-white' : 'text-white'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Badge destacada siempre visible */}
      {imagen.destacada && !hover && (
        <div className="absolute top-1.5 right-1.5">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
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

// ── Cola de subida ────────────────────────────────────────────────────────────

function UploadQueue({
  files,
  onRemove,
}: {
  files: File[]
  onRemove: (index: number) => void
}) {
  if (files.length === 0) return null
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {files.map((f, i) => (
        <div
          key={i}
          className="relative rounded-lg border border-brand-azul/30 bg-brand-azul/5 p-2 flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4 text-brand-azul shrink-0" />
          <span className="text-xs truncate flex-1">{f.name}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="w-4 h-4 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function GaleriaPage() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [soloDestacadas, setSoloDestacadas] = useState(false)

  const { data, isLoading, isError, refetch } = useGaleria(
    0,
    40,
    soloDestacadas
  )
  const imagenes: ImagenGaleria[] = data?.content ?? []

  const subir = useSubirImagen()
  const destacar = useDestacarImagen()
  const eliminar = useEliminarImagen()

  function handleFiles(files: File[]) {
    setPendingFiles((prev) => [...prev, ...files])
  }

  function removeFromQueue(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    for (const file of pendingFiles) {
      await subir.mutateAsync({ archivo: file })
    }
    setPendingFiles([])
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Galería' }]}
      />

      <PageHeader
        title="Galería de Imágenes"
        description="Sube y organiza las imágenes del sitio"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoloDestacadas(!soloDestacadas)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                soloDestacadas
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-700'
                  : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              {soloDestacadas ? 'Todas' : 'Solo destacadas'}
            </button>
          </div>
        }
      />

      {/* Drop zone */}
      <DropZone onFiles={handleFiles} />

      {/* Upload queue */}
      {pendingFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {pendingFiles.length} archivo
                {pendingFiles.length !== 1 ? 's' : ''} para subir
              </p>
              <Button
                size="sm"
                className="bg-brand-azul text-white gap-1.5"
                onClick={handleUpload}
                disabled={subir.isPending}
              >
                <Upload className="h-3.5 w-3.5" />
                {subir.isPending ? 'Subiendo...' : 'Subir todo'}
              </Button>
            </div>
            <UploadQueue files={pendingFiles} onRemove={removeFromQueue} />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!isLoading && imagenes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {data?.totalElements ?? imagenes.length} imágenes ·{' '}
          {imagenes.filter((i) => i.destacada).length} destacadas
        </p>
      )}

      {isLoading && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && imagenes.length === 0 && (
        <EmptyState
          title="Sin imágenes"
          description="Sube la primera imagen usando el área de arriba."
          icon={<ImageIcon className="h-6 w-6" />}
        />
      )}

      {!isLoading && imagenes.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {imagenes.map((img) => (
            <ImageCard
              key={img.id}
              imagen={img}
              onDestacar={() =>
                destacar.mutate({ id: img.id, destacada: img.destacada })
              }
              onEliminar={() => setDeleteId(img.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar imagen?"
        description="La imagen será eliminada permanentemente del servidor."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        isLoading={eliminar.isPending}
      />
    </div>
  )
}
