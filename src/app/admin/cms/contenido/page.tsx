'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Pencil, Globe, Eye, EyeOff, Search, X,
  ChevronLeft, ChevronRight, ImageIcon,
} from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  useSeccionesWeb,
  useContenidoWeb,
  useActualizarContenidoWeb,
} from '@/hooks/useContenidoWeb'
import { useDebounce } from '@/hooks/useDebounce'
import { ContenidoWeb, ActualizarContenidoWebPayload } from '@/types/cms.types'
import { cn } from '@/lib/utils'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  valorEs:            z.string().min(1, 'Requerido').max(5000),
  valorEn:            z.string().max(5000).optional(),
  imagenUrl:          z.string().max(500).optional().or(z.literal('')),
  descripcion:        z.string().max(300).optional(),
  visible:            z.boolean().default(true),
  metadatos:          z.string().optional(),
  ordenVisualizacion: z.coerce.number().int().min(0).default(0),
})
type FormValues = z.infer<typeof schema>

// ── Edit dialog ───────────────────────────────────────────────────────────────

function ContenidoEditDialog({
  item, open, onOpenChange, isLoading, onSubmit,
}: {
  item: ContenidoWeb | null
  open: boolean
  onOpenChange: (v: boolean) => void
  isLoading: boolean
  onSubmit: (payload: ActualizarContenidoWebPayload) => void
}) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (item) {
      reset({
        valorEs:            item.valorEs ?? '',
        valorEn:            item.valorEn ?? '',
        imagenUrl:          item.imagenUrl ?? '',
        descripcion:        item.descripcion ?? '',
        visible:            item.visible,
        metadatos:          item.metadatos ?? '',
        ordenVisualizacion: item.ordenVisualizacion ?? 0,
      })
    }
  }, [item, reset])

  const imagenUrlValue = watch('imagenUrl')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar contenido
            {item && (
              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {item.clave}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              valorEs:            data.valorEs,
              valorEn:            data.valorEn || undefined,
              imagenUrl:          data.imagenUrl || undefined,
              descripcion:        data.descripcion || undefined,
              metadatos:          data.metadatos || undefined,
              visible:            data.visible,
              ordenVisualizacion: data.ordenVisualizacion,
            })
          )}
          className="space-y-4 pt-1"
        >
          <div className="space-y-1">
            <Label htmlFor="valorEs">Contenido (ES) *</Label>
            <Textarea id="valorEs" rows={4} {...register('valorEs')} className="resize-y" />
            {errors.valorEs && (
              <p className="text-xs text-destructive">{errors.valorEs.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="valorEn">Contenido (EN)</Label>
            <Textarea
              id="valorEn" rows={3} {...register('valorEn')}
              className="resize-y" placeholder="Traducción al inglés (opcional)"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="imagenUrl">URL de imagen</Label>
            <Input id="imagenUrl" {...register('imagenUrl')} placeholder="https://..." />
            {errors.imagenUrl && (
              <p className="text-xs text-destructive">{errors.imagenUrl.message}</p>
            )}
            {imagenUrlValue && imagenUrlValue.startsWith('http') && (
              <div className="mt-2 rounded-lg border overflow-hidden h-24 bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagenUrlValue}
                  alt="preview"
                  className="h-full object-contain"
                  onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="descripcion">Descripción interna</Label>
              <Input id="descripcion" {...register('descripcion')} placeholder="Nota para el admin" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ordenVisualizacion">Orden</Label>
              <Input
                id="ordenVisualizacion" type="number" min={0}
                {...register('ordenVisualizacion')} className="w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="metadatos">Metadatos (JSON)</Label>
            <Textarea
              id="metadatos" rows={3} {...register('metadatos')}
              className="resize-none font-mono text-xs" placeholder='{"key": "value"}'
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input type="checkbox" id="visible" {...register('visible')} className="w-4 h-4 rounded" />
            <Label htmlFor="visible" className="cursor-pointer">Visible en el sitio</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-brand-azul text-white">
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Fila de contenido ─────────────────────────────────────────────────────────

function ContenidoRow({
  item, onEdit, onToggleVisible, isTogglingId,
}: {
  item: ContenidoWeb
  onEdit: (item: ContenidoWeb) => void
  onToggleVisible: (item: ContenidoWeb) => void
  isTogglingId: number | null
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3 hover:border-gray-200 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {item.clave}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs h-5',
              item.visible
                ? 'text-emerald-600 border-emerald-200'
                : 'text-muted-foreground'
            )}
          >
            {item.visible
              ? <><Eye className="h-3 w-3 mr-1" />Visible</>
              : <><EyeOff className="h-3 w-3 mr-1" />Oculto</>
            }
          </Badge>
          {item.imagenUrl && (
            <Badge variant="outline" className="text-xs h-5 text-muted-foreground">
              <ImageIcon className="h-3 w-3 mr-1" />Imagen
            </Badge>
          )}
        </div>

        <p className="text-sm mt-1.5 text-gray-800 line-clamp-2 leading-snug">
          {item.valorEs}
        </p>

        {item.descripcion && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.descripcion}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm" variant="ghost"
          className="h-7 w-7 p-0"
          title={item.visible ? 'Ocultar' : 'Mostrar'}
          disabled={isTogglingId === item.id}
          onClick={() => onToggleVisible(item)}
        >
          {item.visible
            ? <EyeOff className="h-3.5 w-3.5 text-gray-400" />
            : <Eye className="h-3.5 w-3.5 text-gray-400" />
          }
        </Button>
        <Button
          size="sm" variant="ghost"
          className="h-7 w-7 p-0"
          title="Editar"
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ContenidoWebPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const seccionId = searchParams.get('seccion') || undefined
  const page = Number(searchParams.get('page')) || 0

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [editTarget, setEditTarget]   = useState<ContenidoWeb | null>(null)
  const [togglingId, setTogglingId]   = useState<number | null>(null)

  const claveBusqueda = useDebounce(search.trim() || undefined, 350)

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const currentSearch = searchParams.get('search') || ''
    const targetSearch = claveBusqueda || ''

    if (currentSearch !== targetSearch) {
      if (targetSearch) {
        params.set('search', targetSearch)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [claveBusqueda, pathname, router, searchParams])

  const {
    data: secciones = [], isLoading: loadingSecciones,
    isError: errorSecciones, refetch: refetchSecciones,
  } = useSeccionesWeb()

  const {
    data: paged, isLoading: loadingItems,
    isError: errorItems, refetch: refetchItems,
  } = useContenidoWeb(claveBusqueda, seccionId, page)

  const actualizar = useActualizarContenidoWeb()

  const items      = paged?.content      ?? []
  const totalPages = paged?.totalPages   ?? 0
  const total      = paged?.totalElements ?? 0

  function handleSeccionChange(codigo: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (codigo) {
      params.set('seccion', codigo)
    } else {
      params.delete('seccion')
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(value: string) {
    setSearch(value)
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 0) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleEdit(payload: ActualizarContenidoWebPayload) {
    if (!editTarget) return
    actualizar.mutate(
      { id: editTarget.id, payload },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  function handleToggleVisible(item: ContenidoWeb) {
    setTogglingId(item.id)
    actualizar.mutate(
      { id: item.id, payload: { valorEs: item.valorEs, visible: !item.visible } },
      { onSettled: () => setTogglingId(null) }
    )
  }

  if (errorSecciones) return <ErrorState onRetry={refetchSecciones} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Contenido Web' }]} />

      <PageHeader
        title="Contenido Web"
        description="Edita los textos dinámicos del sitio organizados por secciones"
      />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar de secciones */}
        <aside className="lg:w-56 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Secciones
          </p>
          {loadingSecciones ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSeccionChange(undefined)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  seccionId === undefined
                    ? 'bg-brand-azul text-white font-medium'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                Todas
              </button>
              {secciones.map((s) => (
                <button
                  key={s.codigo} type="button"
                  onClick={() => handleSeccionChange(s.codigo)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    seccionId === s.codigo
                      ? 'bg-brand-azul text-white font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Lista de contenido */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por clave…"
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {errorItems && <ErrorState onRetry={refetchItems} />}

          {loadingItems && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          )}

          {!loadingItems && !errorItems && items.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description={search ? `No hay contenido que coincida con "${search}".` : 'No hay entradas de contenido para esta sección.'}
              icon={<Globe className="h-6 w-6" />}
            />
          )}

          {!loadingItems && items.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">
                {total} {total === 1 ? 'entrada' : 'entradas'}
                {search && ` · búsqueda: "${search}"`}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <ContenidoRow
                    key={item.id} item={item}
                    onEdit={setEditTarget}
                    onToggleVisible={handleToggleVisible}
                    isTogglingId={togglingId}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Página {page + 1} de {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm" variant="outline"
                      disabled={page === 0}
                      onClick={() => handlePageChange(page - 1)}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      disabled={page >= totalPages - 1}
                      onClick={() => handlePageChange(page + 1)}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ContenidoEditDialog
        item={editTarget}
        open={editTarget !== null}
        onOpenChange={(v) => !v && setEditTarget(null)}
        isLoading={actualizar.isPending}
        onSubmit={handleEdit}
      />
    </div>
  )
}
