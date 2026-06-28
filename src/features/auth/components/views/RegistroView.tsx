'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  CreditCard,
  User,
  FileText,
  Hash,
  Clock,
  Pencil,
} from 'lucide-react'

import { registroSchema, RegistroFormValues } from '../../schemas/auth.schema'
import { useRegistro } from '../../hooks/useRegistro'
import { legalService } from '@/services/legal.service'
import { ContenidoLegal } from '@/types/legal.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'

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
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function RegistroView() {
  const { isAdmin: esAdmin } = useAuth()
  const registroMutation = useRegistro()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [docAbierto, setDocAbierto] = useState<
    'TERMINOS' | 'PRIVACIDAD' | null
  >(null)
  const [docCargando, setDocCargando] = useState(false)
  const [docCargado, setDocCargado] = useState<ContenidoLegal | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      aceptaTerminos: false,
      aceptaPrivacidad: false,
    },
  })

  async function abrirDocumento(tipo: 'TERMINOS' | 'PRIVACIDAD') {
    setDocAbierto(tipo)
    setDocCargado(null)
    setDocCargando(true)
    try {
      const doc = await legalService.obtenerPublico(tipo)
      setDocCargado(doc)
    } catch {
      toast.error('No se pudo cargar el documento.')
      setDocAbierto(null)
    } finally {
      setDocCargando(false)
    }
  }

  const onSubmit = (values: RegistroFormValues) => {
    registroMutation.mutate(values, {
      onError: (err: any) => {
        const fieldErrors = err.erroresCampo || err.errorsCampo
        if (fieldErrors && fieldErrors.length > 0) {
          fieldErrors.forEach((error: any) => {
            if (error.campo === 'correo') {
              setError('correo', { type: 'manual', message: error.mensaje })
            } else if (error.campo === 'numeroDocumento') {
              setError('dni', { type: 'manual', message: error.mensaje })
            } else if (error.campo) {
              setError(error.campo as any, {
                type: 'manual',
                message: error.mensaje,
              })
            }
          })
        }
      },
    })
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
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] relative overflow-hidden items-center justify-center p-12">
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
              <h2 className="text-2xl font-black">Únete a nuestra familia</h2>
              <p className="text-white/60 text-sm max-w-xs mx-auto">
                Crea tu cuenta gratis y gestiona tus entradas, reservas y
                eventos desde un solo lugar.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { n: 'Gratis', label: 'Registro' },
                { n: 'Rápido', label: 'En segundos' },
                { n: 'Seguro', label: 'Datos protegidos' },
              ].map(({ n, label }) => (
                <div
                  key={n}
                  className="bg-white/8 rounded-xl p-3 text-center border border-white/10"
                >
                  <div className="font-black text-brand-amarillo text-sm">
                    {n}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8 space-y-6">
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
                Crea tu cuenta
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Regístrate para comprar entradas y gestionar tus eventos
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field
                id="nombre"
                label="Nombre completo"
                placeholder="Juan Pérez"
                icon={<User />}
                error={errors.nombre?.message}
                required
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    placeholder="Juan Pérez"
                    className="h-11 rounded-xl pl-9"
                    {...register('nombre')}
                  />
                </div>
              </Field>

              <Field
                id="correo"
                label="Correo electrónico"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="contrasena"
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
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
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Field
                  id="confirmarContrasena"
                  label="Confirmar contraseña"
                  placeholder="Repite la contraseña"
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
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="telefono"
                  label="Teléfono"
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

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Aceptación de políticas
                </p>

                <div className="flex items-start gap-3">
                  <Controller
                    name="aceptaTerminos"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="aceptaTerminos"
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 shrink-0"
                      />
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="aceptaTerminos"
                      className="text-sm text-gray-700 cursor-pointer leading-snug"
                    >
                      He leído y acepto los{' '}
                      <button
                        type="button"
                        onClick={() => abrirDocumento('TERMINOS')}
                        className="text-brand-azul font-semibold hover:underline"
                      >
                        Términos y Condiciones
                      </button>
                    </label>
                    {errors.aceptaTerminos && (
                      <p className="text-xs text-destructive mt-0.5">
                        {errors.aceptaTerminos.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Controller
                    name="aceptaPrivacidad"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="aceptaPrivacidad"
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 shrink-0"
                      />
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="aceptaPrivacidad"
                      className="text-sm text-gray-700 cursor-pointer leading-snug"
                    >
                      He leído y acepto la{' '}
                      <button
                        type="button"
                        onClick={() => abrirDocumento('PRIVACIDAD')}
                        className="text-brand-azul font-semibold hover:underline"
                      >
                        Política de Privacidad
                      </button>
                    </label>
                    {errors.aceptaPrivacidad && (
                      <p className="text-xs text-destructive mt-0.5">
                        {errors.aceptaPrivacidad.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold text-base gap-2"
                disabled={registroMutation.isPending}
              >
                {registroMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                Crear cuenta gratis
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

      <Dialog
        open={!!docAbierto}
        onOpenChange={(open) => !open && setDocAbierto(null)}
      >
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-brand-azul shrink-0" />
              {docCargando
                ? 'Cargando...'
                : (docCargado?.titulo ??
                  (docAbierto === 'TERMINOS'
                    ? 'Términos y Condiciones'
                    : 'Política de Privacidad'))}
            </DialogTitle>
            {docCargado && (
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Versión {docCargado.version}
                </span>
                {docCargado.fechaActualizacion && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Actualizado:{' '}
                    {new Date(docCargado.fechaActualizacion).toLocaleDateString(
                      'es-PE',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {docCargando ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-azul mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Cargando documento...
                  </p>
                </div>
              </div>
            ) : docCargado ? (
              <div
                className="text-sm leading-relaxed text-gray-700"
                style={{ lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{
                  __html: docCargado.contenido.replace(/\n/g, '<br />'),
                }}
              />
            ) : null}
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 flex-row items-center justify-between">
            <div>
              {esAdmin && docAbierto && (
                <Link
                  href="/admin/cms/legal"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-azul hover:underline font-medium"
                  onClick={() => setDocAbierto(null)}
                >
                  <Pencil className="h-3 w-3" />
                  Editar este documento
                </Link>
              )}
            </div>
            <Button
              type="button"
              className="bg-brand-azul hover:bg-brand-azul/90 text-white"
              onClick={() => setDocAbierto(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
