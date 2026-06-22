import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { IconPicker } from '@/components/admin/comercial/shared/IconPicker'
import { useTipoEventoMutations } from '../hooks/useTiposEvento'
import { TipoEventoFormValues, tipoEventoSchema } from '../schemas/tipo-evento.schema'
import { TipoEvento } from '@/types/comercial.types'

interface TipoEventoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoEvento: TipoEvento | null
}

export function TipoEventoFormDialog({
  open,
  onOpenChange,
  tipoEvento,
}: TipoEventoFormDialogProps) {
  const { crear, actualizar } = useTipoEventoMutations()
  const isEditing = !!tipoEvento

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TipoEventoFormValues>({
    resolver: zodResolver(tipoEventoSchema),
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

  async function onSubmit(data: TipoEventoFormValues) {
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
      // Handled by query mutation
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
            <Label>Descripción</Label>
            <Textarea
              rows={2}
              {...register('descripcion')}
              className="resize-none"
              placeholder="Descripción opcional del tipo de evento"
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
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
              {errors.orden && <p className="text-xs text-destructive">{errors.orden.message}</p>}
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
