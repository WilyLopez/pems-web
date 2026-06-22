'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Building2, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSede, useActualizarSede } from '@/hooks/useConfiguracion'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  nombre: z.string().min(2).max(120),
  direccion: z.string().min(2).max(300),
  ciudad: z.string().min(2).max(80),
  departamento: z.string().min(2).max(80),
  telefono: z.string().max(20).optional().or(z.literal('')),
  correo: z.string().max(120).optional().or(z.literal('')),
  ruc: z
    .string()
    .length(11, 'El RUC debe tener 11 dígitos')
    .optional()
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function SedeTab() {
  const { idSede } = useAuth()
  const idSedeNum = idSede ?? null

  const { data: sede, isLoading } = useSede(idSedeNum)
  const actualizar = useActualizarSede(idSedeNum)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (sede) {
      reset({
        nombre: sede.nombre,
        direccion: sede.direccion,
        ciudad: sede.ciudad,
        departamento: sede.departamento,
        telefono: sede.telefono ?? '',
        correo: sede.correo ?? '',
        ruc: sede.ruc ?? '',
      })
    }
  }, [sede, reset])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      nombre: values.nombre,
      direccion: values.direccion,
      ciudad: values.ciudad,
      departamento: values.departamento,
      telefono: values.telefono || null,
      correo: values.correo || null,
      ruc: values.ruc || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Datos de la sede</h3>
          <p className="text-xs text-muted-foreground">
            Información del local principal del negocio
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nombre">Nombre del local</Label>
          <Input id="nombre" {...register('nombre')} />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            placeholder="Av. Ejemplo 123, Miraflores"
            {...register('direccion')}
          />
          {errors.direccion && (
            <p className="text-xs text-destructive">
              {errors.direccion.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" placeholder="Lima" {...register('ciudad')} />
          {errors.ciudad && (
            <p className="text-xs text-destructive">{errors.ciudad.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departamento">Departamento</Label>
          <Input
            id="departamento"
            placeholder="Lima"
            {...register('departamento')}
          />
          {errors.departamento && (
            <p className="text-xs text-destructive">
              {errors.departamento.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            placeholder="01 234 5678"
            {...register('telefono')}
          />
          {errors.telefono && (
            <p className="text-xs text-destructive">
              {errors.telefono.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="correo">Correo de contacto</Label>
          <Input
            id="correo"
            type="email"
            placeholder="contacto@example.com"
            {...register('correo')}
          />
          {errors.correo && (
            <p className="text-xs text-destructive">{errors.correo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ruc">RUC</Label>
          <Input
            id="ruc"
            placeholder="20123456789"
            maxLength={11}
            {...register('ruc')}
          />
          {errors.ruc && (
            <p className="text-xs text-destructive">{errors.ruc.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          size="sm"
        >
          {actualizar.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
