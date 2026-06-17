'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import { Textarea } from '@/components/ui/Textarea'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { IconPicker, DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { useServiciosCotizacionAdmin, useServicioCotizacionMutations } from '@/hooks/useComercial'
import { ServicioCotizacion } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'

const schema = z.object({
  nombre:            z.string().min(1).max(50),
  descripcion:       z.string().max(200).optional(),
  precioReferencial: z.coerce.number().min(0).optional(),
  icono:             z.string().max(30).optional(),
  activo:            z.boolean().default(true),
  orden:             z.coerce.number().default(0),
})
type FormValues = z.infer<typeof schema>

export default function ServiciosCotizacionPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServicioCotizacion | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: servicios = [], isLoading, isError, refetch } = useServiciosCotizacionAdmin()
  const { crear, actualizar, eliminar } = useServicioCotizacionMutations()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function handleOpenForm(s: ServicioCotizacion | null = null) {
    setEditTarget(s)
    if (s) {
      reset({
        nombre: s.nombre,
        descripcion: s.descripcion ?? '',
        precioReferencial: s.precioReferencial ?? 0,
        icono: s.icono ?? '',
        activo: s.activo,
        orden: s.orden,
      })
    } else {
      reset({
        nombre: '',
        descripcion: '',
        precioReferencial: 0,
        icono: 'Package',
        activo: true,
        orden: servicios.length,
      })
    }
    setFormOpen(true)
  }

  async function onSubmit(data: FormValues) {
    try {
      if (editTarget) {
        await actualizar.mutateAsync({ id: editTarget.id, payload: data })
      } else {
        await crear.mutateAsync(data)
      }
      setFormOpen(false)
    } catch {
      toast.error('No se pudo guardar el servicio')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comercial', href: '/admin/comercial' }, { label: 'Servicios de Cotización' }]} />

      <PageHeader
        title="Servicios de Cotización"
        description="Catálogo de servicios extras que se pueden incluir en presupuestos de eventos"
        actions={
          <Button size="sm" className="bg-brand-azul text-white gap-1.5" onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4" /> Nuevo servicio
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : servicios.length === 0 ? (
        <EmptyState
          title="Sin servicios"
          description="Crea servicios adicionales para las cotizaciones de eventos."
          icon={<LayoutGrid className="h-10 w-10 text-muted-foreground" />}
          action={<Button onClick={() => handleOpenForm()}>Crear servicio</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.sort((a, b) => a.orden - b.orden).map((s) => (
            <Card key={s.id} className={!s.activo ? 'opacity-60' : undefined}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-brand-azul/10 flex items-center justify-center text-brand-azul">
                      <DynamicIcon name={s.icono} className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{s.nombre}</h3>
                      <p className="text-xs text-muted-foreground">Orden: {s.orden}</p>
                    </div>
                  </div>
                  <QuickToggle
                    activo={s.activo}
                    onToggle={() => actualizar.mutate({ id: s.id, payload: { ...s, activo: !s.activo } })}
                    isPending={actualizar.isPending && (actualizar.variables as any)?.id === s.id}
                  />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  {s.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t mt-auto">
                  <span className="text-sm font-bold text-brand-azul">
                    {s.precioReferencial ? formatCurrency(s.precioReferencial) : 'Precio variable'}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenForm(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input {...register('nombre')} placeholder="Ej: Show de Títeres" />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea {...register('descripcion')} placeholder="Detalles del servicio..." rows={3} className="resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio Referencial</Label>
                <Input type="number" step="0.01" {...register('precioReferencial')} />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" {...register('orden')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <Controller
                control={control}
                name="icono"
                render={({ field }) => (
                  <IconPicker value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" {...register('activo')} id="chk-activo" className="h-4 w-4 rounded" />
              <Label htmlFor="chk-activo" className="cursor-pointer">Servicio activo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-brand-azul text-white">
                {editTarget ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar servicio"
        description="El servicio será eliminado del catálogo de cotización."
        onConfirm={() => {
          if (deleteId) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
