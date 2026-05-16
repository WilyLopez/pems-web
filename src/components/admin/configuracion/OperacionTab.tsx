'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracion } from '@/hooks/useConfiguracion'
import { ConfiguracionSistema } from '@/types/configuracion.types'

const schema = z.object({
  HORA_APERTURA: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  HORA_CIERRE: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  AFORO_MAXIMO: z.coerce.number().int().min(1).max(10000),
  INTERVALO_PREPARACION_INICIO: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  INTERVALO_PREPARACION_FIN: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})

type FormValues = z.infer<typeof schema>

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map((c) => [c.clave, c.valor]))
}

export function OperacionTab({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const map = toMap(configs)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      HORA_APERTURA: map.HORA_APERTURA ?? '10:00',
      HORA_CIERRE: map.HORA_CIERRE ?? '20:00',
      AFORO_MAXIMO: Number(map.AFORO_MAXIMO ?? 60),
      INTERVALO_PREPARACION_INICIO: map.INTERVALO_PREPARACION_INICIO ?? '14:00',
      INTERVALO_PREPARACION_FIN: map.INTERVALO_PREPARACION_FIN ?? '16:00',
    },
  })

  useEffect(() => {
    const m = toMap(configs)
    reset({
      HORA_APERTURA: m.HORA_APERTURA ?? '10:00',
      HORA_CIERRE: m.HORA_CIERRE ?? '20:00',
      AFORO_MAXIMO: Number(m.AFORO_MAXIMO ?? 60),
      INTERVALO_PREPARACION_INICIO: m.INTERVALO_PREPARACION_INICIO ?? '14:00',
      INTERVALO_PREPARACION_FIN: m.INTERVALO_PREPARACION_FIN ?? '16:00',
    })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      HORA_APERTURA: values.HORA_APERTURA,
      HORA_CIERRE: values.HORA_CIERRE,
      AFORO_MAXIMO: String(values.AFORO_MAXIMO),
      INTERVALO_PREPARACION_INICIO: values.INTERVALO_PREPARACION_INICIO,
      INTERVALO_PREPARACION_FIN: values.INTERVALO_PREPARACION_FIN,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-azul/10">
          <Clock className="h-4 w-4 text-brand-azul" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Horarios del local</h3>
          <p className="text-xs text-muted-foreground">
            Hora de apertura y cierre del local (formato 24 h)
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="HORA_APERTURA">Hora de apertura</Label>
          <Input
            id="HORA_APERTURA"
            type="time"
            {...register('HORA_APERTURA')}
          />
          {errors.HORA_APERTURA && (
            <p className="text-xs text-destructive">
              {errors.HORA_APERTURA.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="HORA_CIERRE">Hora de cierre</Label>
          <Input id="HORA_CIERRE" type="time" {...register('HORA_CIERRE')} />
          {errors.HORA_CIERRE && (
            <p className="text-xs text-destructive">
              {errors.HORA_CIERRE.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="AFORO_MAXIMO">Aforo máximo (personas)</Label>
          <Input
            id="AFORO_MAXIMO"
            type="number"
            min={1}
            {...register('AFORO_MAXIMO')}
          />
          {errors.AFORO_MAXIMO && (
            <p className="text-xs text-destructive">
              {errors.AFORO_MAXIMO.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Intervalo de preparación entre turnos
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="INTERVALO_PREPARACION_INICIO">
              Inicio del intervalo
            </Label>
            <Input
              id="INTERVALO_PREPARACION_INICIO"
              type="time"
              {...register('INTERVALO_PREPARACION_INICIO')}
            />
            {errors.INTERVALO_PREPARACION_INICIO && (
              <p className="text-xs text-destructive">
                {errors.INTERVALO_PREPARACION_INICIO.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="INTERVALO_PREPARACION_FIN">Fin del intervalo</Label>
            <Input
              id="INTERVALO_PREPARACION_FIN"
              type="time"
              {...register('INTERVALO_PREPARACION_FIN')}
            />
            {errors.INTERVALO_PREPARACION_FIN && (
              <p className="text-xs text-destructive">
                {errors.INTERVALO_PREPARACION_FIN.message}
              </p>
            )}
          </div>
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
