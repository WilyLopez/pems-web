'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { UserPlus, Loader2 } from 'lucide-react'
import { clienteFormSchema, ClienteFormValues, TIPOS_DOCUMENTO } from '../../schema/cliente.schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface ClienteFormProps {
  onSubmit: (values: ClienteFormValues) => void
  isSubmitting: boolean
  onCancel: () => void
  submitLabel?: string
}

export function ClienteForm({
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel = 'Registrar cliente'
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: { tipoDocumentoCodigo: 'DNI', aceptaComunicaciones: true },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="col-span-full space-y-1.5">
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

      <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel} className="rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-xl gap-1.5">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
