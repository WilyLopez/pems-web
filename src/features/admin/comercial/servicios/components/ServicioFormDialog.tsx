import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { IconPicker } from '@/components/admin/comercial/shared/IconPicker'
import { useServicioCotizacionMutations } from '../hooks/useServicios'
import { ServicioFormValues, servicioSchema } from '../schemas/servicio.schema'
import { ServicioCotizacion } from '@/types/comercial.types'
import { toast } from 'sonner'

interface ServicioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servicio: ServicioCotizacion | null
  siguienteOrden: number
}

export function ServicioFormDialog({
  open,
  onOpenChange,
  servicio,
  siguienteOrden,
}: ServicioFormDialogProps) {
  const { crear, actualizar } = useServicioCotizacionMutations()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
  })

  useEffect(() => {
    if (open) {
      if (servicio) {
        reset({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion ?? '',
          precioReferencial: servicio.precioReferencial ?? 0,
          icono: servicio.icono ?? '',
          activo: servicio.activo,
          orden: servicio.orden,
        })
      } else {
        reset({
          nombre: '',
          descripcion: '',
          precioReferencial: 0,
          icono: 'Package',
          activo: true,
          orden: siguienteOrden,
        })
      }
    }
  }, [open, servicio, reset, siguienteOrden])

  async function onSubmit(data: ServicioFormValues) {
    try {
      if (servicio) {
        await actualizar.mutateAsync({ id: servicio.id, payload: data })
      } else {
        await crear.mutateAsync(data)
      }
      onOpenChange(false)
    } catch {
      toast.error('No se pudo guardar el servicio')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {servicio ? 'Editar servicio' : 'Nuevo servicio'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input {...register('nombre')} placeholder="Ej: Show de Títeres" />
            {errors.nombre && (
              <p className="text-xs text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              {...register('descripcion')}
              placeholder="Detalles del servicio..."
              rows={3}
              className="resize-none"
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Referencial</Label>
              <Input
                type="number"
                step="0.01"
                {...register('precioReferencial')}
              />
              {errors.precioReferencial && (
                <p className="text-xs text-destructive">
                  {errors.precioReferencial.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} />
              {errors.orden && (
                <p className="text-xs text-destructive">
                  {errors.orden.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <Controller
              control={control}
              name="icono"
              render={({ field }) => (
                <IconPicker
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              {...register('activo')}
              id="chk-activo"
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="chk-activo" className="cursor-pointer">
              Servicio activo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-brand-azul text-white"
              disabled={crear.isPending || actualizar.isPending}
            >
              {servicio ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
