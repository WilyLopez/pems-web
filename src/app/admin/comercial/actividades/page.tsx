'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Zap, Image as ImageIcon } from 'lucide-react'
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
import { useActividadesAdmin, useActividadMutations } from '@/hooks/useComercial'
import { useZonasPublico } from '@/hooks/useComercial'
import { ActividadLocal } from '@/types/comercial.types'

const schema = z.object({
  nombre: z.string().min(1).max(40),
  descripcion: z.string().min(1).max(100),
  imagenUrl: z.string().nullable().optional(),
  idZona: z.number({ coerce: true }).optional().nullable(),
  esEspecial: z.boolean().default(false),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  activa: z.boolean().default(true),
  destacada: z.boolean().default(false),
  orden: z.number({ coerce: true }).default(0),
})
type FormValues = z.infer<typeof schema>

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function fixMediaUrl(url: string | null | undefined) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api/')[0] ?? ''
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function ActividadFormDialog({
  open,
  onOpenChange,
  actividad,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  actividad: ActividadLocal | null
}) {
  const { crear, actualizar } = useActividadMutations()
  const { data: zonas = [] } = useZonasPublico()
  const isEditing = !!actividad

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      imagenUrl: null,
      idZona: null,
      esEspecial: false,
      fechaInicio: '',
      fechaFin: '',
      activa: true,
      destacada: false,
      orden: 0,
    },
  })

  // Sincronizar datos cuando cambia la actividad o se abre el modal
  useEffect(() => {
    if (open) {
      if (actividad) {
        reset({
          nombre: actividad.nombre,
          descripcion: actividad.descripcion,
          imagenUrl: actividad.imagenUrl ?? null,
          idZona: actividad.idZona ?? null,
          esEspecial: actividad.esEspecial,
          fechaInicio: actividad.fechaInicio ?? '',
          fechaFin: actividad.fechaFin ?? '',
          activa: actividad.activa,
          destacada: actividad.destacada,
          orden: actividad.orden,
        })
      } else {
        reset({
          nombre: '',
          descripcion: '',
          imagenUrl: null,
          idZona: null,
          esEspecial: false,
          fechaInicio: '',
          fechaFin: '',
          activa: true,
          destacada: false,
          orden: 0,
        })
      }
    }
  }, [open, actividad, reset])

  const imagenUrl = watch('imagenUrl')
  const esEspecial = watch('esEspecial')

  function onSubmit(data: FormValues) {
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl || undefined,
      idZona: data.idZona || undefined,
      esEspecial: data.esEspecial,
      fechaInicio: data.fechaInicio || undefined,
      fechaFin: data.fechaFin || undefined,
    }
    if (isEditing && actividad) {
      actualizar.mutate(
        { id: actividad.id, payload: { ...payload, activa: data.activa, destacada: data.destacada, orden: data.orden } },
        { onSuccess: () => { onOpenChange(false); reset() } }
      )
    } else {
      crear.mutate(payload, { onSuccess: () => { onOpenChange(false); reset() } })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar actividad' : 'Nueva actividad'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input {...register('nombre')} className="mt-1" placeholder="Escalada" />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <Label>Descripcion *</Label>
            <Input {...register('descripcion')} className="mt-1" placeholder="Actividad de..." />
            {errors.descripcion && <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>}
          </div>

          <div>
            <Label>Imagen</Label>
            <div className="mt-1">
              <MediaUploader
                value={imagenUrl ?? null}
                onChange={(url) => setValue('imagenUrl', url)}
                carpeta="actividades"
                aspectRatio="4:3"
              />
            </div>
          </div>

          <div>
            <Label>Zona asociada (opcional)</Label>
            <select
              {...register('idZona', { valueAsNumber: true })}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Sin zona</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('esEspecial')} className="w-4 h-4 rounded" />
            <span className="text-sm">Es actividad especial (temporal)</span>
          </label>

          {esEspecial && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Fecha inicio</Label>
                <Input type="date" {...register('fechaInicio')} className="mt-1" />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input type="date" {...register('fechaFin')} className="mt-1" />
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                <span className="text-sm">Activa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                <span className="text-sm">Destacada</span>
              </label>
              <div className="ml-auto flex items-center gap-2">
                <Label className="text-sm">Orden</Label>
                <Input type="number" {...register('orden')} className="w-20 h-8" />
              </div>
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
              {crear.isPending || actualizar.isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ActividadesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ActividadLocal | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: actividades = [], isLoading, isError, refetch } = useActividadesAdmin()
  const { eliminar } = useActividadMutations()

  const regulares = actividades.filter((a) => !a.esEspecial)
  const especiales = actividades.filter((a) => a.esEspecial)

  if (isError) return <ErrorState onRetry={refetch} />

  function renderTabla(lista: ActividadLocal[]) {
    if (lista.length === 0) return (
      <EmptyState title="Sin actividades" description="Crea la primera."
        icon={<Zap className="h-6 w-6" />} />
    )
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
            {lista.map((a) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.imagenUrl ? (
                      <img src={fixMediaUrl(a.imagenUrl)} alt={a.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0" />
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
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.nombreZona ?? '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {a.fechaInicio && a.fechaFin ? `${a.fechaInicio} — ${a.fechaFin}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge className={a.activa ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}>
                    {a.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
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
      <Breadcrumbs
        items={[{ label: 'Comercial', href: '/admin/comercial/actividades' }, { label: 'Actividades' }]}
      />

      <PageHeader
        title="Actividades"
        description="Gestiona las actividades regulares y especiales del local"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            Nueva actividad
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
          <TabsContent value="regulares" className="mt-4">{renderTabla(regulares)}</TabsContent>
          <TabsContent value="especiales" className="mt-4">{renderTabla(especiales)}</TabsContent>
        </Tabs>
      )}

      <ActividadFormDialog open={formOpen} onOpenChange={setFormOpen} actividad={editTarget} />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar actividad"
        description="La actividad sera eliminada permanentemente."
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
