'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { Loader2, Save } from 'lucide-react'
import {
  editarClienteSchema,
  EditarClienteFormValues,
} from '../../schema/editarCliente.schema'
import { Cliente } from '../../types'
import { useMutacionesCliente } from '../../hooks/useClientesData'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface EditarClienteModalProps {
  cliente: Cliente | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarClienteModal({
  cliente,
  open,
  onOpenChange,
}: EditarClienteModalProps) {
  const { actualizarCliente } = useMutacionesCliente(cliente?.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditarClienteFormValues>({
    resolver: zodResolver(editarClienteSchema),
  })

  useEffect(() => {
    if (!cliente) return
    reset({
      nombres: cliente.nombres,
      apellidoPaterno: cliente.apellidoPaterno ?? '',
      apellidoMaterno: cliente.apellidoMaterno ?? '',
      telefono: cliente.telefono ?? '',
      correo: cliente.correo ?? '',
      fechaNacimiento: '',
      aceptaComunicaciones: cliente.aceptaComunicaciones,
    })
  }, [cliente, reset])

  if (!cliente) return null

  const tieneCorreo = Boolean(cliente.correo)

  function onSubmit(values: EditarClienteFormValues) {
    if (!cliente) return
    actualizarCliente.mutate(
      {
        id: cliente.id,
        payload: {
          nombres: values.nombres,
          apellidoPaterno: values.apellidoPaterno,
          apellidoMaterno: values.apellidoMaterno || undefined,
          telefono: values.telefono || undefined,
          correo: tieneCorreo ? undefined : values.correo || undefined,
          fechaNacimiento: values.fechaNacimiento || undefined,
          aceptaComunicaciones: values.aceptaComunicaciones,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-full space-y-1.5">
              <Label>Documento</Label>
              <Input
                value={
                  cliente.numeroDocumento
                    ? `${cliente.tipoDocumentoCodigo}: ${cliente.numeroDocumento}`
                    : 'No registrado'
                }
                disabled
              />
              <p className="text-xs text-gray-400">
                El documento no se puede modificar una vez registrado.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" {...register('nombres')} />
              {errors.nombres && (
                <p className="text-xs text-red-500">{errors.nombres.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apellidoPaterno">Apellido paterno *</Label>
              <Input id="apellidoPaterno" {...register('apellidoPaterno')} />
              {errors.apellidoPaterno && (
                <p className="text-xs text-red-500">
                  {errors.apellidoPaterno.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apellidoMaterno">Apellido materno</Label>
              <Input id="apellidoMaterno" {...register('apellidoMaterno')} />
              {errors.apellidoMaterno && (
                <p className="text-xs text-red-500">
                  {errors.apellidoMaterno.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register('telefono')} />
              {errors.telefono && (
                <p className="text-xs text-red-500">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                disabled={tieneCorreo}
                {...register('correo')}
              />
              {tieneCorreo ? (
                <p className="text-xs text-gray-400">
                  El correo ya registrado no se puede modificar desde aquí.
                </p>
              ) : (
                errors.correo && (
                  <p className="text-xs text-red-500">
                    {errors.correo.message}
                  </p>
                )
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                {...register('fechaNacimiento')}
              />
              {errors.fechaNacimiento && (
                <p className="text-xs text-red-500">
                  {errors.fechaNacimiento.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('aceptaComunicaciones')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Acepta recibir comunicaciones y promociones
            </span>
          </label>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={actualizarCliente.isPending}
              className="rounded-xl gap-1.5"
            >
              {actualizarCliente.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
