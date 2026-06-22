'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Clock, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracionCalendario } from '@/hooks/useConfiguracion'
import { ConfiguracionCalendario } from '@/types/configuracion.types'

const schema = z.object({
  horaApertura:  z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  horaCierre:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  aforoMaximo:   z.coerce.number().int().min(1),
  turnoT1Inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT1Fin:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT2Inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT2Fin:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  config: ConfiguracionCalendario
  idSede: number
}

export function OperacionTab({ config, idSede }: Props) {
  const actualizar = useActualizarConfiguracionCalendario(idSede)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      horaApertura:  config.horaApertura,
      horaCierre:    config.horaCierre,
      aforoMaximo:   config.aforoMaximo,
      turnoT1Inicio: config.turnoT1Inicio,
      turnoT1Fin:    config.turnoT1Fin,
      turnoT2Inicio: config.turnoT2Inicio,
      turnoT2Fin:    config.turnoT2Fin,
    },
  })

  useEffect(() => {
    reset({
      horaApertura:  config.horaApertura,
      horaCierre:    config.horaCierre,
      aforoMaximo:   config.aforoMaximo,
      turnoT1Inicio: config.turnoT1Inicio,
      turnoT1Fin:    config.turnoT1Fin,
      turnoT2Inicio: config.turnoT2Inicio,
      turnoT2Fin:    config.turnoT2Fin,
    })
  }, [config, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      ...config,
      horaApertura:  values.horaApertura,
      horaCierre:    values.horaCierre,
      aforoMaximo:   values.aforoMaximo,
      turnoT1Inicio: values.turnoT1Inicio,
      turnoT1Fin:    values.turnoT1Fin,
      turnoT2Inicio: values.turnoT2Inicio,
      turnoT2Fin:    values.turnoT2Fin,
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
          <p className="text-xs text-muted-foreground">Hora de apertura y cierre (formato 24 h)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="horaApertura">Hora de apertura</Label>
          <Input id="horaApertura" type="time" {...register('horaApertura')} />
          {errors.horaApertura && <p className="text-xs text-destructive">{errors.horaApertura.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="horaCierre">Hora de cierre</Label>
          <Input id="horaCierre" type="time" {...register('horaCierre')} />
          {errors.horaCierre && <p className="text-xs text-destructive">{errors.horaCierre.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="aforoMaximo">Aforo máximo (personas)</Label>
          <Input id="aforoMaximo" type="number" min={1} {...register('aforoMaximo')} />
          {errors.aforoMaximo && <p className="text-xs text-destructive">{errors.aforoMaximo.message}</p>}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Turnos de atención</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="turnoT1Inicio">Inicio turno 1</Label>
            <Input id="turnoT1Inicio" type="time" {...register('turnoT1Inicio')} />
            {errors.turnoT1Inicio && <p className="text-xs text-destructive">{errors.turnoT1Inicio.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="turnoT1Fin">Fin turno 1</Label>
            <Input id="turnoT1Fin" type="time" {...register('turnoT1Fin')} />
            {errors.turnoT1Fin && <p className="text-xs text-destructive">{errors.turnoT1Fin.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="turnoT2Inicio">Inicio turno 2</Label>
            <Input id="turnoT2Inicio" type="time" {...register('turnoT2Inicio')} />
            {errors.turnoT2Inicio && <p className="text-xs text-destructive">{errors.turnoT2Inicio.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="turnoT2Fin">Fin turno 2</Label>
            <Input id="turnoT2Fin" type="time" {...register('turnoT2Fin')} />
            {errors.turnoT2Fin && <p className="text-xs text-destructive">{errors.turnoT2Fin.message}</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          El intervalo entre el fin del turno 1 y el inicio del turno 2 es el tiempo de preparación del local.
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          )}
        </Button>
      </div>
    </form>
  )
}
