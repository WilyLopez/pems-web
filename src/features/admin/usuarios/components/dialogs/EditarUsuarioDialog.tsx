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

function toTitleCase(value: string): string {
  return value.trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

function handleTelefonoChange(
  e: React.ChangeEvent<HTMLInputElement>,
  rHFOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
  if (raw.length > 0 && raw[0] !== '9') return
  e.target.value = raw
  rHFOnChange(e)
}

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
    setValue,
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
      { onSuccess: () => handleClose() }
    )
  }

  const {
    onBlur: onNombreBlur,
    onChange: onNombreChange,
    ...nombreRest
  } = register('nombre')

  const {
    onChange: onTelefonoChange,
    ...telefonoRest
  } = register('telefono')

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
            <Input
              id="edit-nombre"
              {...nombreRest}
              onChange={onNombreChange}
              onBlur={(e) => {
                setValue('nombre', toTitleCase(e.target.value), { shouldValidate: true })
                onNombreBlur(e)
              }}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-telefono">Teléfono</Label>
            <Input
              id="edit-telefono"
              type="tel"
              inputMode="numeric"
              maxLength={9}
              placeholder="9XXXXXXXX"
              {...telefonoRest}
              onChange={(e) => handleTelefonoChange(e, onTelefonoChange)}
            />
            {errors.telefono && (
              <p className="text-xs text-destructive">{errors.telefono.message}</p>
            )}
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
