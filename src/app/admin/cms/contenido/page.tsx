'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Globe, Eye, EyeOff } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  useSeccionesWeb,
  useContenidoWeb,
  useActualizarContenidoWeb,
} from '@/hooks/useContenidoWeb'
import { ContenidoWeb, ActualizarContenidoWebPayload } from '@/types/cms.types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  valorEs: z.string().min(1, 'Requerido').max(5000),
  valorEn: z.string().max(5000).optional(),
  imagenUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  descripcion: z.string().max(500).optional(),
  visible: z.boolean().default(true),
  metadatos: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ── Edit dialog ───────────────────────────────────────────────────────────────

function ContenidoEditDialog({
  item,
  open,
  onOpenChange,
  isLoading,
  onSubmit,
}: {
  item: ContenidoWeb | null
  open: boolean
  onOpenChange: (v: boolean) => void
  isLoading: boolean
  onSubmit: (payload: ActualizarContenidoWebPayload) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      valorEs: item?.valorEs ?? '',
      valorEn: item?.valorEn ?? '',
      imagenUrl: item?.imagenUrl ?? '',
      descripcion: item?.descripcion ?? '',
      visible: item?.visible ?? true,
      metadatos: item?.metadatos ?? '',
    },
  })

  function handleOpen(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar contenido
            {item && (
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {item.clave}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              ...data,
              imagenUrl: data.imagenUrl || undefined,
              valorEn: data.valorEn || undefined,
              descripcion: data.descripcion || undefined,
              metadatos: data.metadatos || undefined,
            })
          )}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="valorEs">Valor (ES) *</Label>
            <Textarea
              id="valorEs"
              rows={4}
              {...register('valorEs')}
              className="mt-1 resize-none"
            />
            {errors.valorEs && (
              <p className="text-xs text-destructive mt-1">
                {errors.valorEs.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="valorEn">Valor (EN)</Label>
            <Textarea
              id="valorEn"
              rows={4}
              {...register('valorEn')}
              className="mt-1 resize-none"
              placeholder="Traducción al inglés (opcional)"
            />
          </div>
          <div>
            <Label htmlFor="imagenUrl">URL de imagen</Label>
            <Input
              id="imagenUrl"
              {...register('imagenUrl')}
              className="mt-1"
              placeholder="https://..."
            />
            {errors.imagenUrl && (
              <p className="text-xs text-destructive mt-1">
                {errors.imagenUrl.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción interna</Label>
            <Input
              id="descripcion"
              {...register('descripcion')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="metadatos">Metadatos (JSON)</Label>
            <Textarea
              id="metadatos"
              rows={3}
              {...register('metadatos')}
              className="mt-1 resize-none font-mono text-xs"
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              {...register('visible')}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="visible" className="cursor-pointer">
              Visible en el sitio
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-azul text-white"
            >
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
  item,
  onEdit,
}: {
  item: ContenidoWeb
  onEdit: (item: ContenidoWeb) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {item.clave}
            </span>
            {!item.visible && (
              <Badge
                variant="outline"
                className="text-xs h-5 text-muted-foreground"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Oculto
              </Badge>
            )}
            {item.visible && (
              <Badge
                variant="outline"
                className="text-xs h-5 text-green-600 border-green-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                Visible
              </Badge>
            )}
          </div>
          <p className="text-sm mt-1 text-gray-800 line-clamp-2">
            {item.valorEs}
          </p>
          {item.descripcion && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.descripcion}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 shrink-0"
          onClick={() => onEdit(item)}
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ContenidoWebPage() {
  const [seccionId, setSeccionId] = useState<number | undefined>(undefined)
  const [editTarget, setEditTarget] = useState<ContenidoWeb | null>(null)

  const {
    data: secciones = [],
    isLoading: loadingSecciones,
    isError: errorSecciones,
    refetch: refetchSecciones,
  } = useSeccionesWeb()

  const {
    data: items = [],
    isLoading: loadingItems,
    isError: errorItems,
    refetch: refetchItems,
  } = useContenidoWeb(undefined, seccionId)

  const actualizar = useActualizarContenidoWeb()

  function handleSubmit(payload: ActualizarContenidoWebPayload) {
    if (!editTarget) return
    actualizar.mutate(
      { id: editTarget.id, payload },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  if (errorSecciones) return <ErrorState onRetry={refetchSecciones} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Contenido Web' },
        ]}
      />

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
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSeccionId(undefined)}
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
                  key={s.id}
                  type="button"
                  onClick={() => setSeccionId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    seccionId === s.id
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
        <div className="flex-1 min-w-0">
          {errorItems && <ErrorState onRetry={refetchItems} />}

          {loadingItems && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          )}

          {!loadingItems && !errorItems && items.length === 0 && (
            <EmptyState
              title="Sin contenido"
              description="No hay entradas de contenido para esta sección."
              icon={<Globe className="h-6 w-6" />}
            />
          )}

          {!loadingItems && items.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {items.length} entradas
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <ContenidoRow
                    key={item.id}
                    item={item}
                    onEdit={setEditTarget}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ContenidoEditDialog
        item={editTarget}
        open={editTarget !== null}
        onOpenChange={(v) => !v && setEditTarget(null)}
        isLoading={actualizar.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
