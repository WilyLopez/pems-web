'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, Loader2 } from 'lucide-react'

import { clienteService } from '@/services/cliente.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z.object({
  nombre: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .max(120, { message: 'Maximo 120 caracteres' }),
  correo: z
    .string()
    .email({ message: 'Correo invalido' })
    .max(120)
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .min(1, { message: 'El telefono es obligatorio' })
    .min(6, { message: 'Minimo 6 digitos' })
    .max(20),
  dni: z
    .string()
    .length(8, { message: 'El DNI debe tener exactamente 8 digitos' })
    .optional()
    .or(z.literal('')),
  fechaNacimiento: z.string().optional().or(z.literal('')),
  observaciones: z.string().max(500).optional().or(z.literal('')),
  tipoCliente: z.enum(['PERSONA', 'EMPRESA']).default('PERSONA'),
  aceptaComunicaciones: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function NuevoClienteModal({ open, onOpenChange }: Props) {
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoCliente: 'PERSONA', aceptaComunicaciones: true },
  })

  useEffect(() => {
    if (open) reset({ tipoCliente: 'PERSONA', aceptaComunicaciones: true })
  }, [open, reset])

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      clienteService.registrarAdmin({
        nombre: values.nombre,
        correo: values.correo || undefined,
        telefono: values.telefono,
        dni: values.dni || undefined,
        fechaNacimiento: values.fechaNacimiento || undefined,
        observaciones: values.observaciones || undefined,
        tipoCliente: values.tipoCliente,
        aceptaComunicaciones: values.aceptaComunicaciones,
      }),
    onSuccess: () => {
      toast.success('Cliente registrado correctamente.')
      qc.invalidateQueries({ queryKey: ['clientes'] })
      onOpenChange(false)
    },
    onError: () => toast.error('No se pudo registrar el cliente.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => crear.mutate(v))} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register('nombre')} placeholder="Juan Perez" />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Telefono *</Label>
              <Input id="telefono" {...register('telefono')} placeholder="999888777" />
              {errors.telefono && (
                <p className="text-xs text-red-500">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electronico</Label>
              <Input id="correo" type="email" {...register('correo')} placeholder="juan@email.com" />
              {errors.correo && (
                <p className="text-xs text-red-500">{errors.correo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" {...register('dni')} placeholder="12345678" maxLength={8} />
              {errors.dni && (
                <p className="text-xs text-red-500">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <Input id="fechaNacimiento" type="date" {...register('fechaNacimiento')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipoCliente">Tipo de cliente</Label>
              <select
                id="tipoCliente"
                {...register('tipoCliente')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
              >
                <option value="PERSONA">Persona natural</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <textarea
              id="observaciones"
              {...register('observaciones')}
              rows={2}
              placeholder="Notas internas sobre el cliente..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('aceptaComunicaciones')} className="rounded" />
            <span className="text-sm text-gray-700">
              Acepta recibir comunicaciones y promociones
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
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
              disabled={crear.isPending}
              className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {crear.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Registrar cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
