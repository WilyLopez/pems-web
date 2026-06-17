'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
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

const TIPOS_DOCUMENTO = [
  { value: 'DNI',       label: 'DNI' },
  { value: 'CE',        label: 'Carnet de extranjería' },
  { value: 'RUC',       label: 'RUC' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
]

const schema = z.object({
  tipoDocumentoCodigo: z.string().min(1, { message: 'Selecciona el tipo de documento' }),
  numeroDocumento: z
    .string()
    .min(1, { message: 'El número de documento es obligatorio' })
    .max(20),
  nombres: z
    .string()
    .min(2, { message: 'El nombre es obligatorio' })
    .max(100),
  apellidoPaterno: z
    .string()
    .min(1, { message: 'El apellido paterno es obligatorio' })
    .max(100),
  apellidoMaterno: z.string().max(100).optional().or(z.literal('')),
  correo: z
    .string()
    .email({ message: 'Correo inválido' })
    .max(150)
    .optional()
    .or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
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
    defaultValues: {
      tipoDocumentoCodigo: 'DNI',
      aceptaComunicaciones: true,
    },
  })

  useEffect(() => {
    if (open) reset({ tipoDocumentoCodigo: 'DNI', aceptaComunicaciones: true })
  }, [open, reset])

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      clienteService.registrarAdmin({
        tipoDocumentoCodigo: values.tipoDocumentoCodigo,
        numeroDocumento: values.numeroDocumento,
        nombres: values.nombres,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno || undefined,
        correo: values.correo || undefined,
        telefono: values.telefono || undefined,
        origen: 'ADMIN',
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
              <Label htmlFor="tipoDocumentoCodigo">Tipo de documento *</Label>
              <select
                id="tipoDocumentoCodigo"
                {...register('tipoDocumentoCodigo')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.tipoDocumentoCodigo && (
                <p className="text-xs text-red-500">{errors.tipoDocumentoCodigo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="numeroDocumento">Número de documento *</Label>
              <Input id="numeroDocumento" {...register('numeroDocumento')} placeholder="12345678" />
              {errors.numeroDocumento && (
                <p className="text-xs text-red-500">{errors.numeroDocumento.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" {...register('nombres')} placeholder="Juan Carlos" />
              {errors.nombres && (
                <p className="text-xs text-red-500">{errors.nombres.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apellidoPaterno">Apellido paterno *</Label>
              <Input id="apellidoPaterno" {...register('apellidoPaterno')} placeholder="García" />
              {errors.apellidoPaterno && (
                <p className="text-xs text-red-500">{errors.apellidoPaterno.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apellidoMaterno">Apellido materno</Label>
              <Input id="apellidoMaterno" {...register('apellidoMaterno')} placeholder="López" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register('telefono')} placeholder="999888777" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" {...register('correo')} placeholder="juan@email.com" />
              {errors.correo && (
                <p className="text-xs text-red-500">{errors.correo.message}</p>
              )}
            </div>
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
