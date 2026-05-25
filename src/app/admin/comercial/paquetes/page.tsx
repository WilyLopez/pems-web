'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Package2,
  X,
  Check,
} from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { MediaUploader } from '@/components/common/MediaUploader'
import {
  usePaquetesAdmin,
  usePaqueteMutations,
} from '@/hooks/useComercial'
import { PaqueteEvento } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'

const schema = z.object({
  nombre: z.string().min(1).max(30),
  descripcionCorta: z.string().min(1).max(80),
  descripcionLarga: z.string().max(500).optional(),
  precio: z.number({ coerce: true }).min(0.01),
  badge: z.string().max(20).optional(),
  color: z.string().max(7).optional(),
  imagenUrl: z.string().nullable().optional(),
  duracionMinutos: z.number({ coerce: true }).min(1).optional().nullable(),
  limitepersonas: z.number({ coerce: true }).min(1).optional().nullable(),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  orden: z.number({ coerce: true }).default(0),
  beneficios: z
    .array(z.object({ valor: z.string().max(60) }))
    .max(8)
    .default([]),
})
type FormValues = z.infer<typeof schema>

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function fixMediaUrl(url: string | null | undefined) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api/')[0] ?? ''
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function PaqueteFormDialog({
  open,
  onOpenChange,
  paquete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  paquete: PaqueteEvento | null
}) {
  const { crear, actualizar } = usePaqueteMutations()
  const isEditing = !!paquete

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcionCorta: '',
      descripcionLarga: '',
      precio: 0,
      badge: '',
      color: '#00AEEF',
      imagenUrl: null,
      duracionMinutos: null,
      limitepersonas: null,
      activo: true,
      destacado: false,
      orden: 0,
      beneficios: [],
    },
  })

  // Sincronizar datos cuando cambia el paquete o se abre el modal
  useEffect(() => {
    if (open) {
      if (paquete) {
        reset({
          nombre: paquete.nombre,
          descripcionCorta: paquete.descripcionCorta,
          descripcionLarga: paquete.descripcionLarga ?? '',
          precio: paquete.precio,
          badge: paquete.badge ?? '',
          color: paquete.color ?? '#00AEEF',
          imagenUrl: paquete.imagenUrl ?? null,
          duracionMinutos: paquete.duracionMinutos ?? null,
          limitepersonas: paquete.limitepersonas ?? null,
          activo: paquete.activo,
          destacado: paquete.destacado,
          orden: paquete.orden,
          beneficios: (paquete.beneficios ?? []).map((b) => ({ valor: b })),
        })
      } else {
        reset({
          nombre: '',
          descripcionCorta: '',
          descripcionLarga: '',
          precio: 0,
          badge: '',
          color: '#00AEEF',
          imagenUrl: null,
          duracionMinutos: null,
          limitepersonas: null,
          activo: true,
          destacado: false,
          orden: 0,
          beneficios: [],
        })
      }
    }
  }, [open, paquete, reset])

  const { fields, append, remove } = useFieldArray({ control, name: 'beneficios' })
  const imagenUrl = watch('imagenUrl')
  const descripcionCorta = watch('descripcionCorta')

  function onSubmit(data: FormValues) {
    const beneficios = data.beneficios.map((b) => b.valor).filter(Boolean)
    const payload = {
      nombre: data.nombre,
      descripcionCorta: data.descripcionCorta,
      descripcionLarga: data.descripcionLarga || undefined,
      precio: data.precio,
      badge: data.badge || undefined,
      color: data.color || undefined,
      imagenUrl: data.imagenUrl || undefined,
      duracionMinutos: data.duracionMinutos || undefined,
      limitepersonas: data.limitepersonas || undefined,
      beneficios,
    }
    if (isEditing && paquete) {
      actualizar.mutate(
        { id: paquete.id, payload: { ...payload, activo: data.activo, destacado: data.destacado, orden: data.orden } },
        { onSuccess: () => { onOpenChange(false); reset() } }
      )
    } else {
      crear.mutate(payload, { onSuccess: () => { onOpenChange(false); reset() } })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar paquete' : 'Nuevo paquete'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre *</Label>
              <Input {...register('nombre')} className="mt-1" placeholder="Pack Basico" />
              {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <Label>Precio (S/) *</Label>
              <Input type="number" step="0.01" {...register('precio')} className="mt-1" />
              {errors.precio && <p className="text-xs text-destructive mt-1">{errors.precio.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Descripcion corta *</Label>
              <span className="text-xs text-muted-foreground">{descripcionCorta?.length ?? 0}/80</span>
            </div>
            <Input {...register('descripcionCorta')} placeholder="Resumen en una linea" />
            {errors.descripcionCorta && <p className="text-xs text-destructive mt-1">{errors.descripcionCorta.message}</p>}
          </div>

          <div>
            <Label>Descripcion larga</Label>
            <Textarea rows={3} {...register('descripcionLarga')} className="mt-1 resize-none" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Badge</Label>
              <Input {...register('badge')} className="mt-1" placeholder="Mas vendido" />
            </div>
            <div>
              <Label>Color</Label>
              <input type="color" {...register('color')} className="mt-1 h-9 w-full rounded-md border border-input cursor-pointer" />
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} className="mt-1" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Duracion (min)</Label>
              <Input type="number" {...register('duracionMinutos')} className="mt-1" />
            </div>
            <div>
              <Label>Limite de personas</Label>
              <Input type="number" {...register('limitepersonas')} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Imagen del paquete</Label>
            <div className="mt-1">
              <MediaUploader
                value={imagenUrl ?? null}
                onChange={(url) => setValue('imagenUrl', url)}
                carpeta="paquetes"
                aspectRatio="4:3"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Beneficios ({fields.length}/8)</Label>
              {fields.length < 8 && (
                <button
                  type="button"
                  onClick={() => append({ valor: '' })}
                  className="text-xs text-brand-azul hover:underline"
                >
                  + Agregar beneficio
                </button>
              )}
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <Input
                    {...register(`beneficios.${i}.valor`)}
                    placeholder={`Beneficio ${i + 1}`}
                    className="h-8 text-sm"
                  />
                  <button type="button" onClick={() => remove(i)} className="shrink-0">
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
                <span className="text-sm">Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('destacado')} className="w-4 h-4 rounded" />
                <span className="text-sm">Destacado</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={crear.isPending || actualizar.isPending}
              className="bg-brand-azul text-white"
            >
              {crear.isPending || actualizar.isPending
                ? 'Guardando...'
                : isEditing ? 'Guardar cambios' : 'Crear paquete'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PaquetesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PaqueteEvento | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: paquetes = [], isLoading, isError, refetch } = usePaquetesAdmin()
  const { eliminar, reordenar } = usePaqueteMutations()

  function abrirEditar(p: PaqueteEvento) {
    setEditTarget(p)
    setFormOpen(true)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Comercial', href: '/admin/comercial/paquetes' },
          { label: 'Paquetes' },
        ]}
      />

      <PageHeader
        title="Paquetes de eventos"
        description="Crea y administra los paquetes disponibles para contratar"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            Nuevo paquete
          </Button>
        }
      />

      {!isLoading && paquetes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {paquetes.length} paquetes · {paquetes.filter((p) => p.activo).length} activos
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      )}

      {!isLoading && paquetes.length === 0 && (
        <EmptyState
          title="Sin paquetes"
          description="Crea el primer paquete para ofrecerlo en el sitio."
          icon={<Package2 className="h-6 w-6" />}
          action={
            <Button size="sm" className="bg-brand-azul text-white gap-1.5"
              onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" /> Nuevo paquete
            </Button>
          }
        />
      )}

      {!isLoading && paquetes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p, i) => (
            <Card key={p.id} className="overflow-hidden">
              {p.imagenUrl ? (
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={fixMediaUrl(p.imagenUrl)} alt={p.nombre} className="w-full h-full object-cover" />
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-brand-amarillo text-xs font-bold px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ backgroundColor: p.color ?? '#f3f4f6' }}
                >
                  <Package2 className="h-10 w-10 text-white/60" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{p.nombre}</h3>
                    <p className="text-lg font-bold text-brand-azul">{formatCurrency(p.precio)}</p>
                  </div>
                  <div className="flex gap-1">
                    {!p.activo && <Badge variant="outline" className="text-xs">Inactivo</Badge>}
                    {p.destacado && <Badge className="bg-amber-100 text-amber-800 text-xs">Destacado</Badge>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{p.descripcionCorta}</p>

                {p.beneficios.slice(0, 3).map((b, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                    {b}
                  </div>
                ))}

                <div className="flex items-center gap-1 pt-1 border-t flex-wrap">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1"
                    onClick={() => abrirEditar(p)}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    disabled={i === 0}
                    onClick={() => reordenar.mutate({ id: p.id, nuevoOrden: p.orden - 1 })}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    disabled={i === paquetes.length - 1}
                    onClick={() => reordenar.mutate({ id: p.id, nuevoOrden: p.orden + 1 })}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost"
                    className="h-7 w-7 p-0 ml-auto hover:text-destructive"
                    onClick={() => setDeleteId(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaqueteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        paquete={editTarget}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar paquete"
        description="El paquete sera eliminado permanentemente."
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
