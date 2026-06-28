'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { usePerfilData } from '../../hooks/usePerfilData'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    contrasenaActual: z.string().min(1, 'Requerido'),
    contrasenaNueva: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarContrasena: z.string(),
  })
  .refine((d) => d.contrasenaNueva === d.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  })

type FormValues = z.infer<typeof schema>

const CHECKS = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /\d/.test(p) },
  {
    label: 'Al menos un carácter especial',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
]

function PasswordInput({
  id,
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn(
            'h-10 rounded-xl pr-10',
            error && 'border-red-300 focus-visible:ring-red-400'
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const results = CHECKS.map((c) => ({ ...c, ok: c.test(password) }))
  const score = results.filter((c) => c.ok).length

  const bar =
    score <= 1
      ? 'bg-red-400'
      : score === 2
        ? 'bg-amber-400'
        : score === 3
          ? 'bg-yellow-400'
          : 'bg-green-500'
  const lbl =
    score <= 1
      ? 'Débil'
      : score === 2
        ? 'Regular'
        : score === 3
          ? 'Buena'
          : 'Excelente'

  if (!password) return null

  return (
    <div className="mt-2.5 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i <= score ? bar : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-500 w-16 text-right">
          {lbl}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {results.map((c) => (
          <span
            key={c.label}
            className={cn(
              'text-[11px] flex items-center gap-1.5 font-medium',
              c.ok ? 'text-green-600' : 'text-gray-400'
            )}
          >
            <span
              className={cn(
                'h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px]',
                c.ok ? 'bg-green-100' : 'bg-gray-100'
              )}
            >
              {c.ok ? '✓' : '○'}
            </span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CambiarContrasenaForm() {
  const { cambiarContrasena } = usePerfilData()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const nuevaContrasena = watch('contrasenaNueva', '')

  function onSubmit(values: FormValues) {
    cambiarContrasena.mutate(
      {
        contrasenaActual: values.contrasenaActual,
        contrasenaNueva: values.contrasenaNueva,
      },
      { onSuccess: () => reset() }
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
          <KeyRound className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Cambiar contraseña</h3>
          <p className="text-xs text-gray-500">
            Usa una contraseña fuerte que no hayas utilizado antes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-sm">
        <div className="space-y-1.5">
          <Label
            htmlFor="contrasenaActual"
            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Contraseña actual
          </Label>
          <PasswordInput
            id="contrasenaActual"
            placeholder="Tu contraseña actual"
            error={errors.contrasenaActual?.message}
            {...register('contrasenaActual')}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="contrasenaNueva"
            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Nueva contraseña
          </Label>
          <PasswordInput
            id="contrasenaNueva"
            placeholder="Mínimo 8 caracteres"
            error={errors.contrasenaNueva?.message}
            {...register('contrasenaNueva')}
          />
          <PasswordStrength password={nuevaContrasena} />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirmarContrasena"
            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Confirmar nueva contraseña
          </Label>
          <PasswordInput
            id="confirmarContrasena"
            placeholder="Repite tu nueva contraseña"
            error={errors.confirmarContrasena?.message}
            {...register('confirmarContrasena')}
          />
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={cambiarContrasena.isPending}
            className="w-full rounded-xl gap-1.5 h-10"
          >
            {cambiarContrasena.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {cambiarContrasena.isPending
              ? 'Actualizando...'
              : 'Actualizar contraseña'}
          </Button>
        </div>
      </form>
    </div>
  )
}
