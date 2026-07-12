'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { useSearchParams } from 'next/navigation'
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  activarCuentaSchema,
  ActivarCuentaFormValues,
} from '../../schemas/auth.schema'
import { useActivarCuentaStaff } from '../../hooks/useActivarCuentaStaff'
import { ApiError } from '@/types/api.types'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Un número', ok: /\d/.test(password) },
    {
      label: 'Un carácter especial (!@#$%&*?)',
      ok: /[!@#$%&*?]/.test(password),
    },
  ]
  return (
    <div className="space-y-1.5 mt-2">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <div
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
              c.ok ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            {c.ok && (
              <svg
                viewBox="0 0 10 10"
                className="w-2 h-2 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M2 5l2.5 2.5L8 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            className={`text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ActivarCuentaView() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [verPass, setVerPass] = useState(false)
  const [verConfirm, setVerConfirm] = useState(false)
  const activarMutation = useActivarCuentaStaff()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivarCuentaFormValues>({
    resolver: zodResolver(activarCuentaSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password') ?? ''

  const onSubmit = (values: ActivarCuentaFormValues) => {
    if (!token) return
    setErrorMsg(null)
    activarMutation.mutate(
      { token, nuevaContrasena: values.password },
      {
        onError: (err: ApiError) => {
          setErrorMsg(
            err.message ||
              'No se pudo activar la cuenta. El enlace puede haber expirado.'
          )
        },
      }
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full space-y-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <p className="font-black text-gray-900">Enlace inválido</p>
          <p className="text-sm text-gray-500">
            Este enlace de activación no es válido. Solicita a un administrador
            que te reenvíe la invitación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-brand-azul" />
          </div>
          <div>
            <p className="font-black text-gray-900">Activa tu cuenta</p>
            <p className="text-xs text-gray-500">
              Kiki y Lala · Panel administrativo
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={verPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-9 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setVerPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {verPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            {password.length > 0 && <PasswordStrength password={password} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={verConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-9 pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setVerConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {verConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={activarMutation.isPending}
            className="w-full h-12 flex items-center justify-center gap-2 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl text-sm disabled:opacity-60 transition-colors mt-2"
          >
            {activarMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Activar cuenta
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
