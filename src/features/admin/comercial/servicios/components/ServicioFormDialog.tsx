import { useEffect, useState } from 'react'
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
import { useCategoriasServicioAdmin } from '../hooks/useCategoriasServicio'
import { ServicioFormValues, servicioSchema } from '../schemas/servicio.schema'
import { ServicioCotizacion } from '@/types/comercial.types'
import { VariantesField } from './VariantesField'
import { GaleriaServicioField } from './GaleriaServicioField'
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
  const { data: categorias = [] } = useCategoriasServicioAdmin()
  const [servicioCreado, setServicioCreado] =
    useState<ServicioCotizacion | null>(null)
  const servicioActivo = servicio ?? servicioCreado

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
      setServicioCreado(null)
      if (servicio) {
        reset({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion ?? '',
          precioReferencial: servicio.precioReferencial ?? 0,
          icono: servicio.icono ?? '',
          activo: servicio.activo,
          destacado: servicio.destacado,
          categoriaId: servicio.categoriaId,
          orden: servicio.orden,
        })
      } else {
        reset({
          nombre: '',
          descripcion: '',
          precioReferencial: 0,
          icono: 'Package',
          activo: true,
          destacado: false,
          categoriaId: undefined,
          orden: siguienteOrden,
        })
      }
    }
  }, [open, servicio, reset, siguienteOrden])

  async function onSubmit(data: ServicioFormValues) {
    try {
      if (servicioActivo) {
        const actualizado = await actualizar.mutateAsync({
          id: servicioActivo.id,
          payload: data,
        })
        if (!servicio) setServicioCreado(actualizado)
      } else {
        const creado = await crear.mutateAsync(data)
        setServicioCreado(creado)
      }
    } catch {
      toast.error('No se pudo guardar el servicio')
    }
  }

  const esNuevo = !servicioActivo
  const guardando = crear.isPending || actualizar.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {servicioActivo ? 'Editar servicio' : 'Nuevo servicio'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              {...register('nombre')}
              placeholder="Ej: Show de Títeres"
              aria-invalid={!!errors.nombre}
            />
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
              aria-invalid={!!errors.descripcion}
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
                aria-invalid={!!errors.precioReferencial}
                disabled={servicioActivo?.tieneVariantes}
              />
              {servicioActivo?.tieneVariantes ? (
                <p className="text-xs text-muted-foreground">
                  Este servicio usa el precio de sus variantes.
                </p>
              ) : (
                errors.precioReferencial && (
                  <p className="text-xs text-destructive">
                    {errors.precioReferencial.message}
                  </p>
                )
              )}
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                {...register('orden')}
                aria-invalid={!!errors.orden}
              />
              {errors.orden && (
                <p className="text-xs text-destructive">
                  {errors.orden.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Controller
                control={control}
                name="categoriaId"
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('activo')}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Servicio activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('destacado')}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Destacado</span>
            </label>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <VariantesField idServicio={servicioActivo?.id} />
            <GaleriaServicioField idServicio={servicioActivo?.id} />
          </div>

          {esNuevo && (
            <p className="text-xs text-muted-foreground">
              Guarda el servicio para habilitar variantes e imágenes.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {servicioActivo ? 'Cerrar' : 'Cancelar'}
            </Button>
            <Button
              type="submit"
              className="bg-brand-azul text-white"
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : servicioActivo
                  ? 'Guardar cambios'
                  : 'Crear servicio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
