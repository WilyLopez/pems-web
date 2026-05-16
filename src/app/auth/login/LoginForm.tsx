'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, LogIn, Eye, EyeOff, Star, Users } from 'lucide-react'

import { loginSchema, LoginFormValues } from '@/lib/validations/auth.schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

type TabType = 'cliente' | 'admin'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<TabType>('cliente')
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    const result = await signIn(tab, {
      correo: values.correo,
      contrasena: values.contrasena,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      toast.error('Correo o contraseña incorrectos.')
      return
    }

    const callbackUrl = searchParams.get('callbackUrl')
    router.push(
      callbackUrl ??
        (tab === 'admin' ? '/admin/dashboard' : '/cliente/mis-entradas')
    )
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] relative overflow-hidden items-center justify-center p-12">
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

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo solo visible en mobile */}
          <div className="lg:hidden text-center">
            <Image
              src="/logo-secundario.png"
              alt="Kiki y Lala"
              width={140}
              height={60}
              className="mx-auto"
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

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
            <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-gray-100">
              <TabsTrigger
                value="cliente"
                className="w-full rounded-lg font-semibold flex items-center justify-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                Familia
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="w-full rounded-lg font-semibold flex items-center justify-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                Administrador
              </TabsTrigger>
            </TabsList>

            {(['cliente', 'admin'] as const).map((t) => (
              <TabsContent key={t} value={t} className="mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`correo-${t}`}
                      className="text-sm font-semibold"
                    >
                      Correo electrónico
                    </Label>
                    <Input
                      id={`correo-${t}`}
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
                      <Label
                        htmlFor={`contrasena-${t}`}
                        className="text-sm font-semibold"
                      >
                        Contraseña
                      </Label>
                      <a
                        href="#"
                        className="text-xs text-brand-azul hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id={`contrasena-${t}`}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogIn className="h-5 w-5" />
                    )}
                    Ingresar
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          {tab === 'cliente' && (
            <p className="text-center text-sm text-gray-500">
              ¿Aún no tienes cuenta?{' '}
              <Link
                href="/auth/registro"
                className="font-bold text-brand-rosa hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
          )}

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
