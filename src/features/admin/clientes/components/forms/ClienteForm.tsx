'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { UserPlus, Loader2 } from 'lucide-react'
import { clienteFormSchema, ClienteFormValues, TIPOS_DOCUMENTO } from '../../schema/cliente.schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const DOC_MAX_LENGTH: Record<string, number> = {
  DNI: 8,
  RUC: 11,
  CE: 15,
  PASAPORTE: 15,
}

const DOC_NUMERICO = new Set(['DNI', 'RUC'])

interface ClienteFormProps {
  onSubmit: (values: ClienteFormValues) => void
  isSubmitting: boolean
  onCancel: () => void
  submitLabel?: string
  defaultValues?: Partial<ClienteFormValues>
}

export function ClienteForm({
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel = 'Registrar cliente',
  defaultValues,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      tipoDocumentoCodigo: 'DNI',
      aceptaComunicaciones: true,
      ...defaultValues,
    },
  })

  const tipoDoc = watch('tipoDocumentoCodigo')
  const docMax  = DOC_MAX_LENGTH[tipoDoc] ?? 15
  const docNumerico = DOC_NUMERICO.has(tipoDoc)

  const { onChange: onChangeDoc, ...restDoc } = register('numeroDocumento')
  const { onChange: onChangeTel, ...restTel } = register('telefono')

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
          <Input
            id="numeroDocumento"
            {...restDoc}
            maxLength={docMax}
            inputMode={docNumerico ? 'numeric' : 'text'}
            placeholder={tipoDoc === 'DNI' ? '12345678' : tipoDoc === 'RUC' ? '20123456789' : ''}
            onChange={(e) => {
              const raw = docNumerico
                ? e.target.value.replace(/\D/g, '').slice(0, docMax)
                : e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, docMax).toUpperCase()
              e.target.value = raw
              onChangeDoc(e)
            }}
          />
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
          <Input
            id="telefono"
            {...restTel}
            maxLength={9}
            inputMode="numeric"
            placeholder="999888777"
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9)
              onChangeTel(e)
            }}
          />
          {errors.telefono && (
            <p className="text-xs text-red-500">{errors.telefono.message}</p>
          )}
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
