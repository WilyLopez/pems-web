'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Cake, CalendarCheck, CalendarRange, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracionCalendario } from '../../hooks/useConfiguracionData'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import type { ConfiguracionCalendario } from '../../types'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'

const schema = z.object({
  diasMinReservaPublica: z.coerce.number().int().min(0),
  diasMaxReservaPublica: z.coerce.number().int().min(1),
  rangoMaxBloqueo:       z.coerce.number().int().min(1),
  diasMinEventoPrivado:  z.coerce.number().int().min(1),
  diasMaxEventoPrivado:  z.coerce.number().int().min(1),
  edadMinCumple:         z.coerce.number().int().min(0).max(99),
  edadMaxCumple:         z.coerce.number().int().min(0).max(99),
}).refine(
  d => d.diasMinReservaPublica < d.diasMaxReservaPublica,
  { message: 'El mínimo debe ser menor que el máximo', path: ['diasMaxReservaPublica'] }
).refine(
  d => d.diasMinEventoPrivado < d.diasMaxEventoPrivado,
  { message: 'El mínimo debe ser menor que el máximo', path: ['diasMaxEventoPrivado'] }
).refine(
  d => d.edadMinCumple <= d.edadMaxCumple,
  { message: 'La edad mínima no puede superar la máxima', path: ['edadMaxCumple'] }
)

type FormValues = z.infer<typeof schema>

interface Props {
  config:    ConfiguracionCalendario
  idSede:    number
  navProps?: SeccionNavProps
}

function ReservasEventosForm({ config, idSede }: Props) {
  const actualizar = useActualizarConfiguracionCalendario(idSede)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      diasMinReservaPublica: config.diasMinReservaPublica,
      diasMaxReservaPublica: config.diasMaxReservaPublica,
      rangoMaxBloqueo:       config.rangoMaxBloqueo,
      diasMinEventoPrivado:  config.diasMinEventoPrivado,
      diasMaxEventoPrivado:  config.diasMaxEventoPrivado,
      edadMinCumple:         config.edadMinCumple,
      edadMaxCumple:         config.edadMaxCumple,
    },
  })

  useEffect(() => {
    reset({
      diasMinReservaPublica: config.diasMinReservaPublica,
      diasMaxReservaPublica: config.diasMaxReservaPublica,
      rangoMaxBloqueo:       config.rangoMaxBloqueo,
      diasMinEventoPrivado:  config.diasMinEventoPrivado,
      diasMaxEventoPrivado:  config.diasMaxEventoPrivado,
      edadMinCumple:         config.edadMinCumple,
      edadMaxCumple:         config.edadMaxCumple,
    })
  }, [config, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({ ...config, ...values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-t border-gray-100 pt-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Reservas públicas</p>
            <p className="text-xs text-muted-foreground">Ventana de tiempo para reservas del portal web</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="diasMinReservaPublica">Anticipación mínima</Label>
            <div className="flex items-center gap-2">
              <Input id="diasMinReservaPublica" type="number" min={0} className="max-w-[120px]" {...register('diasMinReservaPublica')} />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">Con 0 el cliente puede reservar el mismo día.</p>
            {errors.diasMinReservaPublica && <p className="text-xs text-destructive">{errors.diasMinReservaPublica.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diasMaxReservaPublica">Anticipación máxima</Label>
            <div className="flex items-center gap-2">
              <Input id="diasMaxReservaPublica" type="number" min={1} className="max-w-[120px]" {...register('diasMaxReservaPublica')} />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">Fechas más lejanas no estarán disponibles.</p>
            {errors.diasMaxReservaPublica && <p className="text-xs text-destructive">{errors.diasMaxReservaPublica.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangoMaxBloqueo">Bloqueo máximo de calendario</Label>
            <div className="flex items-center gap-2">
              <Input id="rangoMaxBloqueo" type="number" min={1} className="max-w-[120px]" {...register('rangoMaxBloqueo')} />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">Duración máxima de un bloqueo administrativo.</p>
            {errors.rangoMaxBloqueo && <p className="text-xs text-destructive">{errors.rangoMaxBloqueo.message}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <CalendarRange className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Eventos privados</p>
            <p className="text-xs text-muted-foreground">Ventana para contratar cumpleaños y eventos corporativos</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="diasMinEventoPrivado">Anticipación mínima</Label>
            <div className="flex items-center gap-2">
              <Input id="diasMinEventoPrivado" type="number" min={1} className="max-w-[120px]" {...register('diasMinEventoPrivado')} />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">Días mínimos para solicitar un evento privado.</p>
            {errors.diasMinEventoPrivado && <p className="text-xs text-destructive">{errors.diasMinEventoPrivado.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diasMaxEventoPrivado">Anticipación máxima</Label>
            <div className="flex items-center gap-2">
              <Input id="diasMaxEventoPrivado" type="number" min={1} className="max-w-[120px]" {...register('diasMaxEventoPrivado')} />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">Fechas más lejanas no podrán ser agendadas.</p>
            {errors.diasMaxEventoPrivado && <p className="text-xs text-destructive">{errors.diasMaxEventoPrivado.message}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
            <Cake className="h-4 w-4 text-pink-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Edades — Cumpleaños</p>
            <p className="text-xs text-muted-foreground">Rango de edad aceptado para el cumpleañero</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edadMinCumple">Edad mínima</Label>
            <div className="flex items-center gap-2">
              <Input id="edadMinCumple" type="number" min={0} max={99} className="max-w-[120px]" {...register('edadMinCumple')} />
              <span className="text-sm text-muted-foreground">años</span>
            </div>
            {errors.edadMinCumple && <p className="text-xs text-destructive">{errors.edadMinCumple.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edadMaxCumple">Edad máxima</Label>
            <div className="flex items-center gap-2">
              <Input id="edadMaxCumple" type="number" min={0} max={99} className="max-w-[120px]" {...register('edadMaxCumple')} />
              <span className="text-sm text-muted-foreground">años</span>
            </div>
            <p className="text-xs text-muted-foreground">Afecta reservas y venta presencial.</p>
            {errors.edadMaxCumple && <p className="text-xs text-destructive">{errors.edadMaxCumple.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            : <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          }
        </Button>
      </div>
    </form>
  )
}

export function ReservasEventosSection({ config, idSede, navProps }: Props) {
  const summary = [
    { label: 'Reserva pública',  value: `${config.diasMinReservaPublica} – ${config.diasMaxReservaPublica} días` },
    { label: 'Evento privado',   value: `${config.diasMinEventoPrivado} – ${config.diasMaxEventoPrivado} días` },
    { label: 'Edad cumpleaños',  value: `${config.edadMinCumple} – ${config.edadMaxCumple} años` },
  ]

  const viewItems = [
    { label: 'Reserva pública (min)',  value: `${config.diasMinReservaPublica} días` },
    { label: 'Reserva pública (máx)',  value: `${config.diasMaxReservaPublica} días` },
    { label: 'Bloqueo máximo',         value: `${config.rangoMaxBloqueo} días` },
    { label: 'Evento privado (min)',   value: `${config.diasMinEventoPrivado} días` },
    { label: 'Evento privado (máx)',   value: `${config.diasMaxEventoPrivado} días` },
    { label: 'Edad cumpleaños',        value: `${config.edadMinCumple} – ${config.edadMaxCumple} años` },
  ]

  return (
    <ModuleCard
      icon={CalendarCheck}
      color="bg-green-50 text-green-600"
      title="Reservas y eventos"
      description="Ventanas de anticipación, bloqueos y edades de cumpleaños"
      summary={summary}
      editSize="sm:max-w-lg"
      viewContent={<ReadOnlyList items={viewItems} />}
      editContent={<ReservasEventosForm config={config} idSede={idSede} />}
      navProps={navProps}
    />
  )
}
