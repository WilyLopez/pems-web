'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { UserCheck, User, CreditCard, Phone, Mail } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  completarPerfilSchema,
  CompletarPerfilFormValues,
} from '../../schemas/auth.schema'
import { useCompletarPerfil } from '../../hooks/useCompletarPerfil'

export function CompletarPerfilView() {
  const { nombre, correo } = useAuth()
  const mutation = useCompletarPerfil()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CompletarPerfilFormValues>({
    resolver: zodResolver(completarPerfilSchema),
    defaultValues: {
      nombres: nombre ?? '',
      dni: '',
      telefono: '',
      aceptaTerminos: false,
    },
  })

  useEffect(() => {
    if (nombre) setValue('nombres', nombre)
  }, [nombre, setValue])

  const onSubmit = (values: CompletarPerfilFormValues) => {
    mutation.mutate(values, {
      onError: (err: any) => {
        const fieldErrors = err.erroresCampo || err.errorsCampo
        fieldErrors?.forEach((e: any) => {
          if (e.campo === 'numeroDocumento') {
            setError('dni', { type: 'manual', message: e.mensaje })
          } else if (e.campo === 'nombres') {
            setError('nombres', { type: 'manual', message: e.mensaje })
          }
        })
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8">
        <div className="space-y-3 text-center">
          <Image
            src="/logo-secundario.png"
            alt="Kiki y Lala"
            width={120}
            height={50}
            className="mx-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-azul/10">
            <UserCheck className="h-7 w-7 text-brand-azul" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Completa tu perfil
          </h1>
          <p className="text-sm text-gray-500">
            Solo necesitamos un par de datos para que puedas reservar y gestionar
            tus eventos.
          </p>
        </div>

        {correo && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate text-sm text-gray-600">{correo}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombres">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="nombres"
                placeholder="Tu nombre"
                className="h-11 rounded-xl pl-9"
                {...register('nombres')}
              />
            </div>
            {errors.nombres && (
              <p className="text-xs text-red-500">{errors.nombres.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="dni"
                  placeholder="12345678"
                  maxLength={8}
                  inputMode="numeric"
                  className="h-11 rounded-xl pl-9"
                  {...register('dni')}
                />
              </div>
              {errors.dni && (
                <p className="text-xs text-red-500">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="telefono"
                  placeholder="987654321"
                  inputMode="numeric"
                  className="h-11 rounded-xl pl-9"
                  {...register('telefono')}
                />
              </div>
              {errors.telefono && (
                <p className="text-xs text-red-500">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <Controller
              name="aceptaTerminos"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="aceptaTerminos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              )}
            />
            <Label
              htmlFor="aceptaTerminos"
              className="text-xs font-normal leading-relaxed text-gray-600"
            >
              Acepto los Términos y Condiciones y la Política de Privacidad de
              Kiki y Lala.
            </Label>
          </div>
          {errors.aceptaTerminos && (
            <p className="text-xs text-red-500">
              {errors.aceptaTerminos.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 w-full rounded-xl bg-brand-azul font-bold text-white hover:bg-brand-azul/90"
          >
            {mutation.isPending ? 'Guardando...' : 'Completar mi perfil'}
          </Button>
        </form>
      </div>
    </div>
  )
}
