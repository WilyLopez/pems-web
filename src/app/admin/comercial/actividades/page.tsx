'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Zap, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
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
import { Label } from '@/components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { MediaUploader } from '@/components/common/MediaUploader'
import { ActividadPreview } from '@/components/admin/comercial/actividades/ActividadPreview'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { useActividadesAdmin, useActividadMutations, useZonasPublico } from '@/hooks/useComercial'
import { ActividadLocal } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

const schema = z.object({
  nombre:      z.string().min(1).max(40),
  descripcion: z.string().min(1).max(100),
  idZona:      z.coerce.number().optional().nullable(),
  esEspecial:  z.boolean().default(false),
  fechaInicio: z.string().optional(),
  fechaFin:    z.string().optional(),
  activa:      z.boolean().default(true),
  destacada:   z.boolean().default(false),
  orden:       z.coerce.number().default(0),
})
type FormValues = z.infer<typeof schema>

function ActividadFormDialog({
  open, onOpenChange, actividad,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  actividad: ActividadLocal | null
}) {
  const { crear, actualizar } = useActividadMutations()
  const { data: zonas = [] }  = useZonasPublico()
  const isEditing = !!actividad
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', descripcion: '', idZona: null,
      esEspecial: false, fechaInicio: '', fechaFin: '',
      activa: true, destacada: false, orden: 0,
    },
  })

  useEffect(() => {
    if (open) {
      if (actividad) {
        reset({
          nombre: actividad.nombre, descripcion: actividad.descripcion,
          idZona: actividad.idZona ?? null, esEspecial: actividad.esEspecial,
          fechaInicio: actividad.fechaInicio ?? '', fechaFin: actividad.fechaFin ?? '',
          activa: actividad.activa, destacada: actividad.destacada, orden: actividad.orden,
        })
        setImagenMedia(actividad.imagenUrl
          ? { url: fixMediaUrl(actividad.imagenUrl), esLocal: false }
          : null)
      } else {
        reset({
          nombre: '', descripcion: '', idZona: null,
          esEspecial: false, fechaInicio: '', fechaFin: '',
          activa: true, destacada: false, orden: 0,
        })
        setImagenMedia(null)
      }
      setMobileTab('form')
    }
  }, [open, actividad, reset])

  const nombre      = watch('nombre')
  const descripcion = watch('descripcion')
  const esEspecial  = watch('esEspecial')
  const idZona      = watch('idZona')
  const nombreZona  = zonas.find((z) => z.id === Number(idZona))?.nombre

  async function onSubmit(data: FormValues) {
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'actividades')
      const payload = {
        nombre: data.nombre, descripcion: data.descripcion,
        imagenUrl: imagenUrl ?? undefined,
        idZona: data.idZona || undefined, esEspecial: data.esEspecial,
        fechaInicio: data.fechaInicio || undefined, fechaFin: data.fechaFin || undefined,
      }
      if (isEditing && actividad) {
        await actualizar.mutateAsync({
          id: actividad.id,
          payload: { ...payload, activa: data.activa, destacada: data.destacada, orden: data.orden },
        })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar la actividad')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar actividad' : 'Nueva actividad'}</DialogTitle>
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
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-6">
            <div className={mobileTab === 'preview' ? 'hidden lg:block' : undefined}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Nombre *</Label>
                  <Input {...register('nombre')} placeholder="Escalada" />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Descripción *</Label>
                  <Input {...register('descripcion')} placeholder="Actividad de..." />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Imagen</Label>
                  <MediaUploader value={imagenMedia} onChange={setImagenMedia} carpeta="actividades" aspectRatio="4:3" uploading={uploading} />
                </div>

                <div className="space-y-1">
                  <Label>Zona asociada (opcional)</Label>
                  <select {...register('idZona', { valueAsNumber: true })}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">Sin zona</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('esEspecial')} className="w-4 h-4 rounded" />
                  <span className="text-sm">Es actividad especial (temporal)</span>
                </label>

                {esEspecial && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Fecha inicio</Label>
                      <Input type="date" {...register('fechaInicio')} />
                    </div>
                    <div className="space-y-1">
                      <Label>Fecha fin</Label>
                      <Input type="date" {...register('fechaFin')} />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Activa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Destacada</span>
                    </label>
                    <div className="flex items-center gap-2 ml-auto">
                      <Label className="text-sm">Orden</Label>
                      <Input type="number" {...register('orden')} className="w-20 h-8" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenMedia(null); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <ActividadPreview
                  nombre={nombre}
                  descripcion={descripcion}
                  imagenUrl={imagenMedia?.url ?? null}
                  esEspecial={esEspecial}
                  nombreZona={nombreZona}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ActividadesPage() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<ActividadLocal | null>(null)
  const [deleteId, setDeleteId]     = useState<number | null>(null)

  const { data: actividades = [], isLoading, isError, refetch } = useActividadesAdmin()
  const { eliminar, reordenar, toggleActivo } = useActividadMutations()

  const regulares  = actividades.filter((a) => !a.esEspecial)
  const especiales = actividades.filter((a) => a.esEspecial)

  async function handleReordenar(lista: ActividadLocal[], id: number, dir: 'arriba' | 'abajo') {
    const sorted = [...lista].sort((a, b) => a.orden - b.orden)
    const idx    = sorted.findIndex((a) => a.id === id)
    if (dir === 'arriba' && idx === 0) return
    if (dir === 'abajo' && idx === sorted.length - 1) return
    const otrIdx = dir === 'arriba' ? idx - 1 : idx + 1
    const actual = sorted[idx]
    const otro   = sorted[otrIdx]
    try {
      await reordenar.mutateAsync({ id: actual.id, nuevoOrden: otro.orden })
      await reordenar.mutateAsync({ id: otro.id,   nuevoOrden: actual.orden })
    } catch {
      toast.error('Error al reordenar')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  function renderTabla(lista: ActividadLocal[]) {
    if (lista.length === 0) return (
      <EmptyState title="Sin actividades" description="Crea la primera."
        icon={<Zap className="h-6 w-6" />} />
    )
    const sorted = [...lista].sort((a, b) => a.orden - b.orden)
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left">Actividad</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Zona</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Fechas</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.imagenUrl ? (
                      <img src={fixMediaUrl(a.imagenUrl)} alt={a.nombre}
                        className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{a.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.nombreZona ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {a.fechaInicio && a.fechaFin ? `${a.fechaInicio} — ${a.fechaFin}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <QuickToggle
                    activo={a.activa}
                    onToggle={() => toggleActivo.mutate(a)}
                    isPending={toggleActivo.isPending && (toggleActivo.variables as ActividadLocal)?.id === a.id}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      disabled={i === 0} onClick={() => handleReordenar(lista, a.id, 'arriba')}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      disabled={i === sorted.length - 1} onClick={() => handleReordenar(lista, a.id, 'abajo')}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => { setEditTarget(a); setFormOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                      onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comercial', href: '/admin/comercial' }, { label: 'Actividades' }]} />

      <PageHeader
        title="Actividades"
        description="Gestiona las actividades regulares y especiales del local"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nueva actividad
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <Tabs defaultValue="regulares">
          <TabsList>
            <TabsTrigger value="regulares">
              Regulares
              {regulares.length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">{regulares.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="especiales">
              Especiales
              {especiales.length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">{especiales.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="regulares"  className="mt-4">{renderTabla(regulares)}</TabsContent>
          <TabsContent value="especiales" className="mt-4">{renderTabla(especiales)}</TabsContent>
        </Tabs>
      )}

      <ActividadFormDialog open={formOpen} onOpenChange={setFormOpen} actividad={editTarget} />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar actividad"
        description="La actividad será eliminada permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
