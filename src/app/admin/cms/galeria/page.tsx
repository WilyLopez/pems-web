'use client'

import { useState } from 'react'
import { Upload, Star, Image as ImageIcon } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useGaleria,
  useSubirImagen,
  useDestacarImagen,
  useEliminarImagen,
} from '@/features/admin/cms/galeria/hooks/useGaleria'
import { ImagenGaleria } from '@/types/galeria.types'
import { ImageCard } from '@/features/admin/cms/galeria/components/ImageCard'
import { DropZone } from '@/features/admin/cms/galeria/components/DropZone'
import { UploadQueue } from '@/features/admin/cms/galeria/components/UploadQueue'

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
        loading={eliminar.isPending}
      />
    </div>
  )
}
