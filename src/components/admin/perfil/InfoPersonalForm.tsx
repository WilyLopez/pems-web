'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, User, Mail, Phone, Briefcase } from 'lucide-react'
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarPerfil } from '@/hooks/usePerfil'
import { cn } from '@/lib/utils'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  telefono: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function FieldWrapper({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ReadonlyField({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType
  label: string
  value: string
  hint?: string
}) {
  return (
    <FieldWrapper>
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </Label>
      <div className="flex items-center gap-2.5 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50">
        <Icon className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500 truncate">{value}</span>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </FieldWrapper>
  )
}

export function InfoPersonalForm({ admin }: { admin: UsuarioAdmin }) {
  const actualizar = useActualizarPerfil()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: admin.nombre, telefono: admin.telefono ?? '' },
  })

  useEffect(() => {
    reset({ nombre: admin.nombre, telefono: admin.telefono ?? '' })
  }, [admin, reset])

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-azul/10">
          <User className="h-4 w-4 text-brand-azul" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Información personal</h3>
          <p className="text-xs text-gray-500">
            Actualiza tu nombre y datos de contacto
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => actualizar.mutate(v))}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper>
            <Label
              htmlFor="nombre"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Nombre completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="nombre"
                className={cn(
                  'pl-9 h-10 rounded-xl',
                  errors.nombre && 'border-red-300 focus-visible:ring-red-400'
                )}
                {...register('nombre')}
              />
            </div>
            {errors.nombre && (
              <p className="text-xs text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </FieldWrapper>

          <ReadonlyField
            icon={Mail}
            label="Correo electrónico"
            value={admin.correo}
            hint="El correo no puede modificarse desde aquí."
          />

          <FieldWrapper>
            <Label
              htmlFor="telefono"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono"
                placeholder="999 999 999"
                className="pl-9 h-10 rounded-xl"
                {...register('telefono')}
              />
            </div>
          </FieldWrapper>

          <ReadonlyField
            icon={Briefcase}
            label="Cargo"
            value={admin.rol}
            hint="El cargo es asignado por el sistema."
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {isDirty
              ? 'Tienes cambios sin guardar.'
              : 'Sin cambios pendientes.'}
          </p>
          <Button
            type="submit"
            disabled={actualizar.isPending || !isDirty}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            {actualizar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {actualizar.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
