'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
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
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { IconPicker, DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { useTiposEventoAdmin, useTipoEventoMutations } from '@/hooks/useComercial'
import { TipoEvento } from '@/types/comercial.types'

const schema = z.object({
  nombre:      z.string().min(1, 'Requerido').max(80),
  descripcion: z.string().max(200).optional(),
  icono:       z.string().max(50).optional(),
  orden:       z.coerce.number().min(0).default(0),
  activo:      z.boolean().default(true),
})
type FormValues = z.infer<typeof schema>

function TipoEventoFormDialog({
  open, onOpenChange, tipoEvento,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  tipoEvento: TipoEvento | null
}) {
  const { crear, actualizar } = useTipoEventoMutations()
  const isEditing = !!tipoEvento

  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '', icono: '', orden: 0, activo: true },
  })

  useEffect(() => {
    if (open) {
      if (tipoEvento) {
        reset({
          nombre: tipoEvento.nombre,
          descripcion: tipoEvento.descripcion ?? '',
          icono: tipoEvento.icono ?? '',
          orden: tipoEvento.orden,
          activo: tipoEvento.activo,
        })
      } else {
        reset({ nombre: '', descripcion: '', icono: '', orden: 0, activo: true })
      }
    }
  }, [open, tipoEvento, reset])

  const nombre = watch('nombre')

  async function onSubmit(data: FormValues) {
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion || undefined,
      icono: data.icono || undefined,
      orden: data.orden,
      activo: data.activo,
    }
    try {
      if (isEditing && tipoEvento) {
        await actualizar.mutateAsync({ codigo: tipoEvento.codigo, payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar tipo de evento' : 'Nuevo tipo de evento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Nombre *</Label>
              <span className="text-xs text-muted-foreground">{nombre?.length ?? 0}/80</span>
            </div>
            <Input {...register('nombre')} placeholder="Ej: Cumpleaños" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Descripcion</Label>
            <Textarea rows={2} {...register('descripcion')} className="resize-none"
              placeholder="Descripcion opcional del tipo de evento" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Icono</Label>
              <Controller
                control={control}
                name="icono"
                render={({ field }) => (
                  <IconPicker value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} />
            </div>
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
              <span className="text-sm">Activo</span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-azul text-white">
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TiposEventoPage() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<TipoEvento | null>(null)
  const [deleteCodigo, setDeleteCodigo] = useState<string | null>(null)

  const { data: tipos = [], isLoading, isError, refetch } = useTiposEventoAdmin()
  const { eliminar, toggleActivo } = useTipoEventoMutations()

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Tipos de Evento' },
      ]} />

      <PageHeader
        title="Tipos de Evento"
        description="Catalogo de tipos de evento para clasificar los paquetes"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nuevo tipo
          </Button>
        }
      />

      {!isLoading && tipos.length > 0 && (
        <p className="text-sm text-muted-foreground">{tipos.length} tipos de evento</p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      )}

      {!isLoading && tipos.length === 0 && (
        <EmptyState
          title="Sin tipos de evento"
          description="Crea el primer tipo de evento para poder clasificar los paquetes."
          icon={<Tag className="h-6 w-6" />}
          action={
            <Button size="sm" className="bg-brand-azul text-white gap-1.5"
              onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" /> Nuevo tipo
            </Button>
          }
        />
      )}

      {!isLoading && tipos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Orden</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.codigo} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-brand-azul/10 text-brand-azul flex items-center justify-center shrink-0">
                        <DynamicIcon name={t.icono} className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{t.nombre}</p>
                        {t.descripcion && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{t.orden}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.esSistema && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs h-5">Sistema</Badge>
                      )}
                      <QuickToggle
                        activo={t.activo}
                        onToggle={() => !t.esSistema && toggleActivo.mutate(t)}
                        isPending={toggleActivo.isPending && (toggleActivo.variables as TipoEvento)?.codigo === t.codigo}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        disabled={t.esSistema}
                        onClick={() => { setEditTarget(t); setFormOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                        disabled={t.esSistema}
                        onClick={() => setDeleteCodigo(t.codigo)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TipoEventoFormDialog
        open={formOpen} onOpenChange={setFormOpen} tipoEvento={editTarget}
      />

      <ConfirmDialog
        open={deleteCodigo !== null}
        onOpenChange={(v) => !v && setDeleteCodigo(null)}
        title="Eliminar tipo de evento"
        description="Esta accion no se puede deshacer. No se podra eliminar si hay paquetes asociados."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteCodigo) eliminar.mutate(deleteCodigo, { onSettled: () => setDeleteCodigo(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
