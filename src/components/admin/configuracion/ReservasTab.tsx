'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Baby, CalendarCheck, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import {
  useActualizarConfiguracionCalendario,
  useConfiguracion,
  useActualizarConfiguracion,
} from '@/hooks/useConfiguracion'
import { ConfiguracionCalendario } from '@/types/configuracion.types'

const schema = z.object({
  diasMinReservaPublica: z.coerce.number().int().min(0),
  diasMaxReservaPublica: z.coerce.number().int().min(1),
  rangoMaxBloqueo:       z.coerce.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

interface Props {
  config: ConfiguracionCalendario
  idSede: number
}

const EDAD_MAX_NINO_KEY = 'EDAD_MAX_NINO'

export function ReservasTab({ config, idSede }: Props) {
  const actualizar = useActualizarConfiguracionCalendario(idSede)

  // Config global: edad máxima del niño
  const { data: sysConfig }  = useConfiguracion()
  const actualizarSys        = useActualizarConfiguracion()
  const edadMaxActual        = parseInt(
    sysConfig?.find(c => c.clave === EDAD_MAX_NINO_KEY)?.valor ?? '12',
    10,
  )
  const [edadMaxInput, setEdadMaxInput] = useState<string>('')
  useEffect(() => {
    if (!Number.isNaN(edadMaxActual)) setEdadMaxInput(String(edadMaxActual))
  }, [edadMaxActual])

  function guardarEdadMax() {
    const num = parseInt(edadMaxInput, 10)
    if (Number.isNaN(num) || num < 1 || num > 17) return
    actualizarSys.mutate({ [EDAD_MAX_NINO_KEY]: String(num) })
  }

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      diasMinReservaPublica: config.diasMinReservaPublica,
      diasMaxReservaPublica: config.diasMaxReservaPublica,
      rangoMaxBloqueo:       config.rangoMaxBloqueo,
    },
  })

  useEffect(() => {
    reset({
      diasMinReservaPublica: config.diasMinReservaPublica,
      diasMaxReservaPublica: config.diasMaxReservaPublica,
      rangoMaxBloqueo:       config.rangoMaxBloqueo,
    })
  }, [config, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      ...config,
      diasMinReservaPublica: values.diasMinReservaPublica,
      diasMaxReservaPublica: values.diasMaxReservaPublica,
      rangoMaxBloqueo:       values.rangoMaxBloqueo,
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Sección: ventanas de reserva ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Reservas públicas</h3>
            <p className="text-xs text-muted-foreground">Ventanas de anticipación y bloqueos</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="diasMinReservaPublica">Anticipación mínima</Label>
            <div className="flex items-center gap-2">
              <Input
                id="diasMinReservaPublica"
                type="number"
                min={0}
                className="max-w-[120px]"
                {...register('diasMinReservaPublica')}
              />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Días mínimos de anticipación para reservar una entrada.
            </p>
            {errors.diasMinReservaPublica && (
              <p className="text-xs text-destructive">{errors.diasMinReservaPublica.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diasMaxReservaPublica">Anticipación máxima</Label>
            <div className="flex items-center gap-2">
              <Input
                id="diasMaxReservaPublica"
                type="number"
                min={1}
                className="max-w-[120px]"
                {...register('diasMaxReservaPublica')}
              />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Con cuántos días de anticipación máxima se puede reservar.
            </p>
            {errors.diasMaxReservaPublica && (
              <p className="text-xs text-destructive">{errors.diasMaxReservaPublica.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rangoMaxBloqueo">Rango máximo de bloqueo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rangoMaxBloqueo"
                type="number"
                min={1}
                className="max-w-[120px]"
                {...register('rangoMaxBloqueo')}
              />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Duración máxima permitida para un bloqueo de calendario.
            </p>
            {errors.rangoMaxBloqueo && (
              <p className="text-xs text-destructive">{errors.rangoMaxBloqueo.message}</p>
            )}
          </div>
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

      <Separator />

      {/* ── Sección: edad máxima permitida para niños ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <Baby className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Edad máxima de niños</h3>
            <p className="text-xs text-muted-foreground">Límite de edad para venta presencial y reservas</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edadMaxNino">Edad máxima permitida</Label>
          <div className="flex items-center gap-3">
            <Input
              id="edadMaxNino"
              type="number"
              min={1}
              max={17}
              value={edadMaxInput}
              onChange={e => setEdadMaxInput(e.target.value)}
              className="max-w-[120px]"
            />
            <span className="text-sm text-muted-foreground">años</span>
            <Button
              type="button"
              size="sm"
              onClick={guardarEdadMax}
              disabled={
                actualizarSys.isPending ||
                edadMaxInput === String(edadMaxActual) ||
                Number.isNaN(parseInt(edadMaxInput, 10))
              }
            >
              {actualizarSys.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Guardar</>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Los niños con edad superior a este valor no podrán ser registrados en entradas.
            Actualmente: <strong>{edadMaxActual} años</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
