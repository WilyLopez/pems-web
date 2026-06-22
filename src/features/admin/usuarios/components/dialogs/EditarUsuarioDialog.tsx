'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { Loader2, Pencil } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { useUsuariosList, useMutacionesUsuario } from '../../hooks/useUsuariosData'
import { editarUsuarioSchema, EditarUsuarioFormValues } from '../../schema/usuario.schema'

export function EditarUsuarioDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { actualizarUsuario } = useMutacionesUsuario()

  const open = modal === 'editar'
  const usuario = usuarios.find((u) => u.id === userId) || null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditarUsuarioFormValues>({ resolver: zodResolver(editarUsuarioSchema) })

  useEffect(() => {
    if (usuario) {
      reset({ nombre: usuario.nombre, telefono: usuario.telefono ?? '' })
    }
  }, [usuario, reset])

  const handleClose = () => {
    reset()
    closeModal()
  }

  const onSubmit = (values: EditarUsuarioFormValues) => {
    if (!usuario) return
    actualizarUsuario.mutate(
      { id: usuario.id, payload: { nombre: values.nombre, telefono: values.telefono } },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={actualizarUsuario.isPending}>
              {actualizarUsuario.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
