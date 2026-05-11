// app/auth/registro/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2, UserPlus, ArrowLeft, Eye, EyeOff,
  Mail, Lock, Phone, CreditCard, User,
} from 'lucide-react'

import { registroSchema, RegistroFormValues } from '@/lib/validations/auth.schema'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'


interface FieldProps {
  id: string
  label: string
  placeholder: string
  icon: React.ReactNode
  error?: string
  hint?: string
  children?: React.ReactNode
  required?: boolean
}

function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-brand-rosa ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = async (values: RegistroFormValues) => {
    setLoading(true)
    try {
      await authService.registrarCliente({
        nombre:     values.nombre,
        correo:     values.correo,
        contrasena: values.contrasena,
        telefono:   values.telefono,
        dni:        values.dni || undefined,
      })
      toast.success('Cuenta creada. Revisa tu correo para verificarla.')
      router.push('/auth/login')
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast.error(e?.message ?? 'No se pudo crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-brand-rosa/20 rounded-full blur-3xl" />
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
            <h2 className="text-2xl font-black">Unete a nuestra familia</h2>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Crea tu cuenta gratis y gestiona tus entradas, reservas y
              eventos desde un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { n: 'Gratis', label: 'Registro' },
              { n: 'Rapido', label: 'En segundos' },
              { n: 'Seguro', label: 'Datos protegidos' },
            ].map(({ n, label }) => (
              <div key={n} className="bg-white/8 rounded-xl p-3 text-center border border-white/10">
                <div className="font-black text-brand-amarillo text-sm">{n}</div>
                <div className="text-white/50 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8 space-y-6">
          {/* Logo mobile */}
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
            <h1 className="text-3xl font-black text-gray-900">Crea tu cuenta</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Registrate para comprar entradas y gestionar tus eventos
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <Field
              id="nombre"
              label="Nombre completo"
              placeholder="Juan Perez"
              icon={<User />}
              error={errors.nombre?.message}
              required
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  placeholder="Juan Perez"
                  className="h-11 rounded-xl pl-9"
                  {...register('nombre')}
                />
              </div>
            </Field>

            {/* Correo */}
            <Field
              id="correo"
              label="Correo electronico"
              placeholder="juan@ejemplo.com"
              icon={<Mail />}
              error={errors.correo?.message}
              required
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="correo"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  className="h-11 rounded-xl pl-9"
                  {...register('correo')}
                />
              </div>
            </Field>

            {/* Contrasenas en grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="contrasena"
                label="Contrasena"
                placeholder="Minimo 8 caracteres"
                icon={<Lock />}
                error={errors.contrasena?.message}
                required
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contrasena"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pl-9 pr-10"
                    {...register('contrasena')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field
                id="confirmarContrasena"
                label="Confirmar contrasena"
                placeholder="Repite la contrasena"
                icon={<Lock />}
                error={errors.confirmarContrasena?.message}
                required
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmarContrasena"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pl-9 pr-10"
                    {...register('confirmarContrasena')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>

            {/* Telefono y DNI en grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="telefono"
                label="Telefono"
                placeholder="987654321"
                icon={<Phone />}
                error={errors.telefono?.message}
                required
              >
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefono"
                    placeholder="987654321"
                    className="h-11 rounded-xl pl-9"
                    {...register('telefono')}
                  />
                </div>
              </Field>

              <Field
                id="dni"
                label="DNI"
                placeholder="12345678"
                icon={<CreditCard />}
                error={errors.dni?.message}
                hint="Opcional"
              >
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dni"
                    placeholder="12345678"
                    maxLength={8}
                    className="h-11 rounded-xl pl-9"
                    {...register('dni')}
                  />
                </div>
              </Field>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold text-base gap-2 mt-2"
              disabled={loading}
            >
              {loading
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <UserPlus className="h-5 w-5" />
              }
              Crear cuenta gratis
            </Button>
          </form>

          <Separator />

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="font-bold text-brand-azul hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-azul transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}  