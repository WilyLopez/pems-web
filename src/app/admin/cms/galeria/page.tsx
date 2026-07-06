'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  useGaleriaInfinita,
  useGaleriaConteo,
  useSubirLote,
  useDestacarImagen,
  useEliminarImagen,
  ArchivoPendiente,
} from '@/features/admin/cms/galeria/hooks/useGaleria'
import { ImagenGaleria } from '@/types/galeria.types'
import {
  CategoriaImagen,
  CategoriaFiltro,
  CATEGORIA_POR_DEFECTO,
  OPCIONES_CATEGORIA,
  TODAS_CATEGORIAS,
} from '@/features/admin/cms/galeria/constants/categorias'
import { MAX_ARCHIVOS_LOTE } from '@/features/admin/cms/galeria/constants/upload'
import {
  claveArchivo,
  nombreBase,
  particionarArchivos,
  slugImagen,
} from '@/features/admin/cms/galeria/lib/archivo'
import { ImageCard } from '@/features/admin/cms/galeria/components/ImageCard'
import { DropZone } from '@/features/admin/cms/galeria/components/DropZone'
import { UploadQueue } from '@/features/admin/cms/galeria/components/UploadQueue'
import { GaleriaFiltros } from '@/features/admin/cms/galeria/components/GaleriaFiltros'
import { GaleriaLightbox } from '@/features/admin/cms/galeria/components/GaleriaLightbox'

export default function GaleriaPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filtroCategoria =
    (searchParams.get('categoria') as CategoriaFiltro) || TODAS_CATEGORIAS
  const soloDestacadas = searchParams.get('destacadas') === 'true'
  const verId = searchParams.get('ver')

  const [pendingItems, setPendingItems] = useState<ArchivoPendiente[]>([])
  const [categoria, setCategoria] = useState<CategoriaImagen>(
    CATEGORIA_POR_DEFECTO
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGaleriaInfinita(soloDestacadas)
  const conteo = useGaleriaConteo()
  const imagenes: ImagenGaleria[] =
    data?.pages.flatMap((pagina) => pagina.content) ?? []
  const imagenesFiltradas =
    filtroCategoria === TODAS_CATEGORIAS
      ? imagenes
      : imagenes.filter((img) => img.categoria === filtroCategoria)

  const lightboxIndex = verId
    ? imagenesFiltradas.findIndex((img) => img.id === Number(verId))
    : -1
  const imagenAEliminar = imagenes.find((img) => img.id === deleteId)

  const galeriaVacia = !isLoading && !conteo.isLoading && conteo.total === 0
  const sinResultados =
    !isLoading &&
    !conteo.isLoading &&
    conteo.total > 0 &&
    imagenesFiltradas.length === 0

  const { subirLote, estados, progreso, isSubiendo, reset } = useSubirLote()
  const destacar = useDestacarImagen()
  const eliminar = useEliminarImagen()

  function actualizarParams(cambios: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) params.delete(clave)
      else params.set(clave, valor)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function handleFiles(nuevos: File[]) {
    const { validos, rechazados } = particionarArchivos(nuevos)
    if (rechazados.length > 0) {
      toast.error(
        `${rechazados.length} archivo(s) omitido(s): formato o tamaño no válido.`
      )
    }
    if (validos.length === 0) return

    setPendingItems((prev) => {
      const previas = new Set(prev.map((it) => claveArchivo(it.file)))
      const nuevosItems: ArchivoPendiente[] = validos
        .filter((f) => !previas.has(claveArchivo(f)))
        .map((f) => ({ file: f, titulo: nombreBase(f.name), descripcion: '' }))
      const combinados = [...prev, ...nuevosItems]
      if (combinados.length > MAX_ARCHIVOS_LOTE) {
        toast.warning(`Máximo ${MAX_ARCHIVOS_LOTE} archivos por lote.`)
        return combinados.slice(0, MAX_ARCHIVOS_LOTE)
      }
      return combinados
    })
  }

  function removeFromQueue(index: number) {
    setPendingItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTitulo(index: number, titulo: string) {
    setPendingItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, titulo } : it))
    )
  }

  async function handleUpload() {
    const { fallidas, fallidasItems } = await subirLote(
      pendingItems,
      categoria,
      conteo.total
    )
    if (fallidas === 0) {
      setPendingItems([])
      reset()
    } else {
      setPendingItems(fallidasItems)
    }
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
      />

      <DropZone onFiles={handleFiles} disabled={isSubiendo} />

      {pendingItems.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {pendingItems.length} archivo
                {pendingItems.length !== 1 ? 's' : ''} para subir
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={categoria}
                  onValueChange={(v) => setCategoria(v as CategoriaImagen)}
                  disabled={isSubiendo}
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPCIONES_CATEGORIA.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="bg-brand-azul text-white gap-1.5"
                  onClick={handleUpload}
                  disabled={isSubiendo}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isSubiendo
                    ? `Subiendo ${progreso.hechas}/${progreso.total}`
                    : 'Subir todo'}
                </Button>
              </div>
            </div>
            <UploadQueue
              items={pendingItems}
              estados={estados}
              onRemove={removeFromQueue}
              onTituloChange={updateTitulo}
              disabled={isSubiendo}
            />
          </CardContent>
        </Card>
      )}

      <GaleriaFiltros
        categoria={filtroCategoria}
        soloDestacadas={soloDestacadas}
        onCategoriaChange={(c) =>
          actualizarParams({
            categoria: c === TODAS_CATEGORIAS ? null : c,
          })
        }
        onSoloDestacadasChange={(v) =>
          actualizarParams({ destacadas: v ? 'true' : null })
        }
      />

      {!isLoading && conteo.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {conteo.total} imágenes · {conteo.destacadas} destacadas
          {filtroCategoria !== TODAS_CATEGORIAS &&
            ` · ${imagenesFiltradas.length} en esta categoría`}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      )}

      {galeriaVacia && (
        <EmptyState
          title="Sin imágenes"
          description="Sube la primera imagen usando el área de arriba."
          icon={<ImageIcon className="h-6 w-6" />}
        />
      )}

      {sinResultados && (
        <EmptyState
          title="Sin resultados"
          description="No hay imágenes que coincidan con el filtro seleccionado."
          icon={<ImageIcon className="h-6 w-6" />}
        />
      )}

      {!isLoading && imagenesFiltradas.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {imagenesFiltradas.map((img) => (
            <ImageCard
              key={img.id}
              imagen={img}
              onVer={() => actualizarParams({ ver: String(img.id) })}
              onDestacar={() =>
                destacar.mutate({ id: img.id, destacada: img.destacada })
              }
              onEditar={() =>
                router.push(`/admin/cms/galeria/${slugImagen(img)}`)
              }
              onEliminar={() => setDeleteId(img.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
          </Button>
        </div>
      )}

      {lightboxIndex >= 0 && (
        <GaleriaLightbox
          imagenes={imagenesFiltradas}
          indice={lightboxIndex}
          onIndice={(i) =>
            actualizarParams({ ver: String(imagenesFiltradas[i].id) })
          }
          onClose={() => actualizarParams({ ver: null })}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar imagen?"
        description={
          imagenAEliminar?.titulo
            ? `La imagen "${imagenAEliminar.titulo}" será eliminada permanentemente del servidor.`
            : 'La imagen será eliminada permanentemente del servidor.'
        }
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
