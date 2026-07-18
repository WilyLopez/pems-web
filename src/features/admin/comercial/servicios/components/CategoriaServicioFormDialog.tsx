import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { useCategoriaServicioMutations } from '../hooks/useCategoriasServicio'
import {
  CategoriaServicioFormValues,
  categoriaServicioSchema,
} from '../schemas/categoria-servicio.schema'
import { CategoriaServicio } from '@/types/comercial.types'

interface CategoriaServicioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: CategoriaServicio | null
}

export function CategoriaServicioFormDialog({
  open,
  onOpenChange,
  categoria,
}: CategoriaServicioFormDialogProps) {
  const { crear, actualizar } = useCategoriaServicioMutations()
  const isEditing = !!categoria

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaServicioFormValues>({
    resolver: zodResolver(categoriaServicioSchema),
    defaultValues: { nombre: '', orden: 0, activo: true },
  })

  useEffect(() => {
    if (open) {
      if (categoria) {
        reset({
          nombre: categoria.nombre,
          orden: categoria.orden,
          activo: categoria.activo,
        })
      } else {
        reset({ nombre: '', orden: 0, activo: true })
      }
    }
  }, [open, categoria, reset])

  async function onSubmit(data: CategoriaServicioFormValues) {
    const payload = {
      nombre: data.nombre,
      orden: data.orden,
      activo: data.activo,
    }
    try {
      if (isEditing && categoria) {
        await actualizar.mutateAsync({ id: categoria.id, payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // Handled by query mutation
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre *</Label>
            <Input {...register('nombre')} placeholder="Ej: Animación" />
            {errors.nombre && (
              <p className="text-xs text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Orden</Label>
            <Input type="number" {...register('orden')} />
            {errors.orden && (
              <p className="text-xs text-destructive">{errors.orden.message}</p>
            )}
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('activo')}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Activa</span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-azul text-white"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
