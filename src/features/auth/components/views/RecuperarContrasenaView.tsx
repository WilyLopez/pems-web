'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { recuperarSchema, RecuperarFormValues } from '../../schemas/auth.schema'
import { useRecuperarContrasena } from '../../hooks/useRecuperarContrasena'

export function RecuperarContrasenaView() {
  const [enviado, setEnviado] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState('')

  const recuperarMutation = useRecuperarContrasena({
    onSuccess: (email) => {
      setEmailEnviado(email)
      setEnviado(true)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarFormValues>({
    resolver: zodResolver(recuperarSchema),
  })

  const onSubmit = (values: RecuperarFormValues) => {
    recuperarMutation.mutate(values)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-brand-azul/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-brand-azul" />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900">Revisa tu correo</p>
            <p className="text-sm text-gray-500 mt-2">
              Te enviamos un enlace para restablecer tu contraseña a{' '}
              <span className="font-semibold text-gray-700">
                {emailEnviado}
              </span>
              .
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Si no ves el correo, revisa tu carpeta de spam.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-azul hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-brand-rosa/20 rounded-full blur-3xl" />
        </div>
        <div className="relative space-y-6 text-center">
          <Image
            src="/logo-principal.png"
            alt="Kiki y Lala"
            width={220}
            height={220}
            className="mx-auto drop-shadow-2xl animate-float"
          />
          <div className="text-white space-y-2">
            <h2 className="text-2xl font-black">Recupera tu acceso</h2>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
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
              Recuperar contraseña
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  className="h-11 rounded-xl pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white font-bold text-base gap-2"
              disabled={recuperarMutation.isPending}
            >
              {recuperarMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Enviar enlace de recuperación
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-azul transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
