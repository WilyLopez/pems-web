'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, LogIn, Eye, EyeOff, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { loginSchema, LoginFormValues } from '../../schemas/auth.schema'
import { useLogin } from '../../hooks/useLogin'

export function LoginView() {
  const [showPass, setShowPass] = useState(false)
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values)
  }

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-brand-rosa/20 rounded-full blur-3xl" />
        </div>

        <div className="relative space-y-8 text-center">
          <Image
            src="/logo-principal.png"
            alt="Kiki y Lala"
            width={260}
            height={260}
            className="mx-auto drop-shadow-2xl animate-float"
          />
          <div className="text-white space-y-2">
            <h2 className="text-3xl font-black">Bienvenido de vuelta</h2>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Inicia sesión para ver tus entradas, reservas y acceder a
              beneficios exclusivos.
            </p>
          </div>
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black text-brand-amarillo">
                  +500
                </span>
              </div>
              <div className="text-xs text-white/50 flex items-center gap-1 justify-center">
                <Users className="h-3 w-3" />
                Familias felices
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-brand-azul">4.9</div>
              <div className="text-xs text-white/50 flex items-center gap-1 justify-center">
                <Star className="h-3 w-3" />
                Calificación
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <Image
              src="/logo-secundario.png"
              alt="Kiki y Lala"
              width={140}
              height={60}
              className="mx-auto"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>

          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Iniciar sesión
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-sm font-semibold">
                Correo electrónico
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                className="h-11 rounded-xl"
                {...register('correo')}
              />
              {errors.correo && (
                <p className="text-xs text-destructive">
                  {errors.correo.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="contrasena" className="text-sm font-semibold">
                  Contraseña
                </Label>
                <Link
                  href="/auth/recuperar-contrasena"
                  className="text-xs text-brand-azul hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                  {...register('contrasena')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.contrasena && (
                <p className="text-xs text-destructive">
                  {errors.contrasena.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white font-bold text-base gap-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Ingresar
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">
                o continuar con
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link
              href="/auth/registro"
              className="font-bold text-brand-rosa hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-brand-azul transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
