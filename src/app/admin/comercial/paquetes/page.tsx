'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Package2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { MediaUploader } from '@/components/common/MediaUploader'
import { PaquetePreview } from '@/components/admin/comercial/paquetes/PaquetePreview'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { usePaquetesAdmin, usePaqueteMutations } from '@/hooks/useComercial'
import { PaqueteEvento } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { formatCurrency } from '@/lib/utils'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

const schema = z.object({
  nombre:           z.string().min(1).max(30),
  descripcionCorta: z.string().min(1).max(80),
  descripcionLarga: z.string().max(500).optional(),
  precio:           z.coerce.number().min(0.01),
  badge:            z.string().max(20).optional(),
  color:            z.string().max(7).optional(),
  duracionMinutos:  z.coerce.number().min(1).optional().nullable(),
  limitepersonas:   z.coerce.number().min(1).optional().nullable(),
  activo:           z.boolean().default(true),
  destacado:        z.boolean().default(false),
  orden:            z.coerce.number().default(0),
  beneficios:       z.array(z.object({ valor: z.string().max(60) })).max(8).default([]),
})
type FormValues = z.infer<typeof schema>

function PaqueteFormDialog({
  open, onOpenChange, paquete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  paquete: PaqueteEvento | null
}) {
  const { crear, actualizar } = usePaqueteMutations()
  const isEditing = !!paquete
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', descripcionCorta: '', descripcionLarga: '',
      precio: 0, badge: '', color: '#00AEEF',
      duracionMinutos: null, limitepersonas: null,
      activo: true, destacado: false, orden: 0, beneficios: [],
    },
  })

  useEffect(() => {
    if (open) {
      if (paquete) {
        reset({
          nombre: paquete.nombre, descripcionCorta: paquete.descripcionCorta,
          descripcionLarga: paquete.descripcionLarga ?? '',
          precio: paquete.precio, badge: paquete.badge ?? '',
          color: paquete.color ?? '#00AEEF',
          duracionMinutos: paquete.duracionMinutos ?? null,
          limitepersonas: paquete.limitepersonas ?? null,
          activo: paquete.activo, destacado: paquete.destacado, orden: paquete.orden,
          beneficios: (paquete.beneficios ?? []).map((b) => ({ valor: b })),
        })
        setImagenMedia(paquete.imagenUrl
          ? { url: fixMediaUrl(paquete.imagenUrl), esLocal: false }
          : null)
      } else {
        reset({
          nombre: '', descripcionCorta: '', descripcionLarga: '',
          precio: 0, badge: '', color: '#00AEEF',
          duracionMinutos: null, limitepersonas: null,
          activo: true, destacado: false, orden: 0, beneficios: [],
        })
        setImagenMedia(null)
      }
      setMobileTab('form')
    }
  }, [open, paquete, reset])

  const { fields, append, remove } = useFieldArray({ control, name: 'beneficios' })
  const nombre          = watch('nombre')
  const precio          = watch('precio')
  const descripcionCorta = watch('descripcionCorta')
  const beneficios      = watch('beneficios')?.map((b) => b.valor) ?? []

  async function onSubmit(data: FormValues) {
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'paquetes')
      const beneficiosArr = data.beneficios.map((b) => b.valor).filter(Boolean)
      const payload = {
        nombre: data.nombre, descripcionCorta: data.descripcionCorta,
        descripcionLarga: data.descripcionLarga || undefined,
        precio: data.precio, badge: data.badge || undefined,
        color: data.color || undefined,
        imagenUrl: imagenUrl ?? undefined,
        duracionMinutos: data.duracionMinutos || undefined,
        limitepersonas: data.limitepersonas || undefined,
        beneficios: beneficiosArr,
      }
      if (isEditing && paquete) {
        await actualizar.mutateAsync({
          id: paquete.id,
          payload: { ...payload, activo: data.activo, destacado: data.destacado, orden: data.orden },
        })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar el paquete')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar paquete' : 'Nuevo paquete'}</DialogTitle>
        </DialogHeader>

        <div className="flex lg:hidden gap-1 rounded-lg bg-muted p-1 mb-2">
          {(['form', 'preview'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setMobileTab(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${mobileTab === t ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}>
              {t === 'form' ? 'Formulario' : 'Vista previa'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">
            <div className={mobileTab === 'preview' ? 'hidden lg:block' : undefined}>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Nombre *</Label>
                    <Input {...register('nombre')} placeholder="Pack Básico" />
                    {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Precio (S/) *</Label>
                    <Input type="number" step="0.01" {...register('precio')} />
                    {errors.precio && <p className="text-xs text-destructive">{errors.precio.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Descripción corta *</Label>
                    <span className="text-xs text-muted-foreground">{descripcionCorta?.length ?? 0}/80</span>
                  </div>
                  <Input {...register('descripcionCorta')} placeholder="Resumen en una línea" />
                  {errors.descripcionCorta && <p className="text-xs text-destructive">{errors.descripcionCorta.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Descripción larga</Label>
                  <Textarea rows={3} {...register('descripcionLarga')} className="resize-none" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Badge</Label>
                    <Input {...register('badge')} placeholder="Más vendido" />
                  </div>
                  <div className="space-y-1">
                    <Label>Color</Label>
                    <input type="color" {...register('color')} className="h-9 w-full rounded-md border border-input cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <Label>Orden</Label>
                    <Input type="number" {...register('orden')} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Duración (min)</Label>
                    <Input type="number" {...register('duracionMinutos')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Límite de personas</Label>
                    <Input type="number" {...register('limitepersonas')} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Imagen del paquete</Label>
                  <MediaUploader
                    value={imagenMedia}
                    onChange={setImagenMedia}
                    carpeta="paquetes"
                    aspectRatio="16:9"
                    uploading={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Beneficios ({fields.length}/8)</Label>
                    {fields.length < 8 && (
                      <button type="button" onClick={() => append({ valor: '' })}
                        className="text-xs text-brand-azul hover:underline">
                        + Agregar
                      </button>
                    )}
                  </div>
                  {fields.map((field, i) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <Input {...register(`beneficios.${i}.valor`)} placeholder={`Beneficio ${i + 1}`} className="h-8 text-sm" />
                      <button type="button" onClick={() => remove(i)}>
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
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
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenMedia(null); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear paquete'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <PaquetePreview
                  nombre={nombre}
                  precio={precio ?? 0}
                  descripcionCorta={descripcionCorta}
                  beneficios={beneficios}
                  imagenUrl={imagenMedia?.url ?? null}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PaquetesPage() {
  const [formOpen, setFormOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<PaqueteEvento | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)

  const { data: paquetes = [], isLoading, isError, refetch } = usePaquetesAdmin()
  const { eliminar, reordenar, toggleActivo } = usePaqueteMutations()

  async function handleReordenar(id: number, dir: 'arriba' | 'abajo') {
    const sorted = [...paquetes].sort((a, b) => a.orden - b.orden)
    const idx    = sorted.findIndex((p) => p.id === id)
    if (dir === 'arriba' && idx === 0) return
    if (dir === 'abajo' && idx === sorted.length - 1) return
    const otrIdx  = dir === 'arriba' ? idx - 1 : idx + 1
    const actual  = sorted[idx]
    const otro    = sorted[otrIdx]
    try {
      await reordenar.mutateAsync({ id: actual.id, nuevoOrden: otro.orden })
      await reordenar.mutateAsync({ id: otro.id,   nuevoOrden: actual.orden })
    } catch {
      toast.error('Error al reordenar')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comercial', href: '/admin/comercial' }, { label: 'Paquetes' }]} />

      <PageHeader
        title="Paquetes de eventos"
        description="Crea y administra los paquetes disponibles para contratar"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nuevo paquete
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
        <EmptyState title="Sin paquetes" description="Crea el primer paquete para ofrecerlo en el sitio."
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
          {[...paquetes].sort((a, b) => a.orden - b.orden).map((p, i, sorted) => (
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
                <div className="aspect-[4/3] flex items-center justify-center"
                  style={{ backgroundColor: p.color ?? '#f3f4f6' }}>
                  <Package2 className="h-10 w-10 text-white/60" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{p.nombre}</h3>
                    <p className="text-lg font-bold text-brand-azul">{formatCurrency(p.precio)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <QuickToggle
                      activo={p.activo}
                      onToggle={() => toggleActivo.mutate(p)}
                      isPending={toggleActivo.isPending && (toggleActivo.variables as PaqueteEvento)?.id === p.id}
                    />
                    {p.destacado && <Badge className="bg-amber-100 text-amber-800 text-xs">Destacado</Badge>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{p.descripcionCorta}</p>

                {p.beneficios.slice(0, 3).map((b, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />{b}
                  </div>
                ))}

                <div className="flex items-center gap-1 pt-1 border-t flex-wrap">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1"
                    onClick={() => { setEditTarget(p); setFormOpen(true) }}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    disabled={i === 0} onClick={() => handleReordenar(p.id, 'arriba')}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    disabled={i === sorted.length - 1} onClick={() => handleReordenar(p.id, 'abajo')}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-auto hover:text-destructive"
                    onClick={() => setDeleteId(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaqueteFormDialog open={formOpen} onOpenChange={setFormOpen} paquete={editTarget} />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar paquete"
        description="El paquete será eliminado permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
