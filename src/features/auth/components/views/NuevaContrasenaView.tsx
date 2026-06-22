'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import Link from 'next/link'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { nuevaSchema, NuevaFormValues } from '../../schemas/auth.schema'
import { useNuevaContrasena } from '../../hooks/useNuevaContrasena'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Un número', ok: /[0-9]/.test(password) },
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
              <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={`text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export function NuevaContrasenaView() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [verPass, setVerPass] = useState(false)
  const [verConfirm, setVerConfirm] = useState(false)
  const nuevaMutation = useNuevaContrasena()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NuevaFormValues>({
    resolver: zodResolver(nuevaSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password') ?? ''

  const onSubmit = (values: NuevaFormValues) => {
    setErrorMsg(null)
    nuevaMutation.mutate(values, {
      onError: (err: any) => {
        setErrorMsg(err.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-brand-azul" />
          </div>
          <div>
            <p className="font-black text-gray-900">Nueva contraseña</p>
            <p className="text-xs text-gray-500">Kiki y Lala · Restablecer acceso</p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{errorMsg}</p>
            <Link
              href="/auth/recuperar-contrasena"
              className="text-xs text-brand-azul hover:underline font-medium mt-1 block"
            >
              Solicitar un nuevo enlace
            </Link>
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
                {verPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
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
                {verConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={nuevaMutation.isPending}
            className="w-full h-12 flex items-center justify-center gap-2 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl text-sm disabled:opacity-60 transition-colors mt-2"
          >
            {nuevaMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Guardar nueva contraseña
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
