'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Loader2, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { useActualizarUsuarioAdmin } from '@/hooks/useUsuariosAdmin'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  telefono: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  usuario: UsuarioAdmin | null
  open: boolean
  onClose: () => void
}

export function EditarUsuarioModal({ usuario, open, onClose }: Props) {
  const actualizar = useActualizarUsuarioAdmin()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (usuario) {
      reset({ nombre: usuario.nombre, telefono: usuario.telefono ?? '' })
    }
  }, [usuario, reset])

  function onSubmit(values: FormValues) {
    if (!usuario) return
    actualizar.mutate(
      { id: usuario.id, nombre: values.nombre, telefono: values.telefono },
      { onSuccess: () => { reset(); onClose() } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Pencil className="h-4 w-4 text-primary" />
            Editar usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-nombre">Nombre completo</Label>
            <Input id="edit-nombre" {...register('nombre')} />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-telefono">Teléfono</Label>
            <Input id="edit-telefono" placeholder="999 999 999" {...register('telefono')} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={actualizar.isPending}>
              {actualizar.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
