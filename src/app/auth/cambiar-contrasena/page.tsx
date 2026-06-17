'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { authService } from '@/services/auth.service'

const schema = z
  .object({
    contrasenaActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nuevaContrasena: z
      .string()
      .min(8, 'La nueva contraseña debe tener mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmar: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((d) => d.nuevaContrasena === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type FormValues = z.infer<typeof schema>

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

export default function CambiarContrasenaPage() {
  const supabase = createClient()
  const { user, token, roles, tipoPerfil } = useAuth()
  const router = useRouter()
  const [verActual, setVerActual] = useState(false)
  const [verNueva, setVerNueva] = useState(false)
  const [exito, setExito] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const nuevaContrasena = watch('nuevaContrasena') ?? ''

  const onSubmit = async (values: FormValues) => {
    setLoading(true)

    try {
      if (!token) throw new Error('No se encontró el token de acceso.')

      await authService.cambiarPasswordMe({
        passwordActual: values.contrasenaActual,
        nuevoPassword: values.nuevaContrasena,
      })

      // Sincronizar el SDK de Supabase con la nueva contraseña
      await supabase.auth.updateUser({ password: values.nuevaContrasena })

      setLoading(false)
      setExito(true)
      toast.success('Contraseña actualizada correctamente.')
    } catch (err: any) {
      setLoading(false)
      const msg = err.message || 'Error al cambiar la contraseña'
      if (msg.includes('contraseña actual no es correcta')) {
        setError('contrasenaActual', { message: 'La contraseña actual es incorrecta.' })
      } else {
        toast.error(msg)
      }
    }
  }

  if (exito) {
    const dashboardUrl = tipoPerfil === 'STAFF' ? '/admin/dashboard' : '/cliente/mi-cuenta'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900">Contraseña actualizada</p>
            <p className="text-sm text-gray-500 mt-1">
              Tu contraseña se cambió correctamente. Puedes seguir usando tu cuenta con normalidad.
            </p>
          </div>
          <button
            onClick={() => { window.location.href = dashboardUrl }}
            className="w-full py-3 bg-brand-azul text-white rounded-xl font-bold text-sm hover:bg-brand-azul/90 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/cliente/mi-cuenta"
            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="font-black text-gray-900">Cambiar contraseña</p>
            <p className="text-xs text-gray-500">Kiki y Lala · Área de seguridad</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-brand-azul/5 border border-brand-azul/20 rounded-xl px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-brand-azul shrink-0" />
          <p className="text-xs text-gray-700">
            Por seguridad, ingresa tu contraseña actual antes de establecer una nueva.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contrasenaActual" className="text-sm font-semibold">
              Contraseña actual
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="contrasenaActual"
                type={verActual ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-9 pr-10"
                {...register('contrasenaActual')}
              />
              <button
                type="button"
                onClick={() => setVerActual((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {verActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.contrasenaActual && (
              <p className="text-xs text-destructive">{errors.contrasenaActual.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nuevaContrasena" className="text-sm font-semibold">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="nuevaContrasena"
                type={verNueva ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-9 pr-10"
                {...register('nuevaContrasena')}
              />
              <button
                type="button"
                onClick={() => setVerNueva((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {verNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.nuevaContrasena && (
              <p className="text-xs text-destructive">{errors.nuevaContrasena.message}</p>
            )}
            {nuevaContrasena.length > 0 && <PasswordStrength password={nuevaContrasena} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmar" className="text-sm font-semibold">
              Confirmar nueva contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmar"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl pl-9"
                {...register('confirmar')}
              />
            </div>
            {errors.confirmar && (
              <p className="text-xs text-destructive">{errors.confirmar.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl text-sm disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Cambiar contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
