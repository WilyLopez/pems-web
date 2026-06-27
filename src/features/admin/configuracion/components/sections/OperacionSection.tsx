'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { CalendarDays, Clock, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracionCalendario } from '../../hooks/useConfiguracionData'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import type { ConfiguracionCalendario } from '../../types'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'

const DIAS = [
  { key: '1', label: 'L' },
  { key: '2', label: 'M' },
  { key: '3', label: 'X' },
  { key: '4', label: 'J' },
  { key: '5', label: 'V' },
  { key: '6', label: 'S' },
  { key: '7', label: 'D' },
] as const

function parseDias(str: string): Set<string> {
  return new Set(str.split(',').map(s => s.trim()).filter(Boolean))
}

function serializeDias(selected: Set<string>): string {
  return DIAS.filter(d => selected.has(d.key)).map(d => d.key).join(',')
}

function formatDias(str: string): string {
  if (!str) return '—'
  const selected = parseDias(str)
  const labels = DIAS.filter(d => selected.has(d.key)).map(d => d.label)
  return labels.length > 0 ? labels.join(' ') : '—'
}

const schema = z.object({
  horaApertura:  z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  horaCierre:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  aforoMaximo:   z.coerce.number().int().min(1),
  turnoT1Inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT1Fin:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT2Inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  turnoT2Fin:    z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  diasOperacion: z.string().min(1, 'Selecciona al menos un día de operación'),
}).refine(
  d => d.horaApertura < d.horaCierre,
  { message: 'La apertura debe ser antes del cierre', path: ['horaCierre'] }
)

type FormValues = z.infer<typeof schema>

interface Props {
  config:    ConfiguracionCalendario
  idSede:    number
  navProps?: SeccionNavProps
}

function OperacionForm({ config, idSede }: Props) {
  const actualizar = useActualizarConfiguracionCalendario(idSede)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      horaApertura:  config.horaApertura,
      horaCierre:    config.horaCierre,
      aforoMaximo:   config.aforoMaximo,
      turnoT1Inicio: config.turnoT1Inicio,
      turnoT1Fin:    config.turnoT1Fin,
      turnoT2Inicio: config.turnoT2Inicio,
      turnoT2Fin:    config.turnoT2Fin,
      diasOperacion: config.diasOperacion,
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
      diasOperacion: config.diasOperacion,
    })
  }, [config, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({ ...config, ...values })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-azul/10">
          <Clock className="h-4 w-4 text-brand-azul" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Horarios del local</p>
          <p className="text-xs text-muted-foreground">Apertura y cierre en formato 24 h</p>
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

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-azul/10">
            <CalendarDays className="h-4 w-4 text-brand-azul" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Días de operación</p>
            <p className="text-xs text-muted-foreground">Días en que el local abre al público</p>
          </div>
        </div>
        <Controller
          name="diasOperacion"
          control={control}
          render={({ field }) => {
            const selected = parseDias(field.value ?? '')
            function toggle(key: string) {
              const next = new Set(selected)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              field.onChange(serializeDias(next))
            }
            return (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  {DIAS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggle(key)}
                      className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                        selected.has(key)
                          ? 'bg-brand-azul text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.diasOperacion && (
                  <p className="text-xs text-destructive">{errors.diasOperacion.message}</p>
                )}
              </div>
            )
          }}
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
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
          El intervalo entre el fin del turno 1 y el inicio del turno 2 es el tiempo de preparación.
        </p>
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

export function OperacionSection({ config, idSede, navProps }: Props) {
  const summary = [
    { label: 'Apertura',       value: config.horaApertura },
    { label: 'Cierre',         value: config.horaCierre },
    { label: 'Días operación', value: formatDias(config.diasOperacion) },
  ]
  const viewItems = [
    ...summary,
    { label: 'Aforo máximo', value: `${config.aforoMaximo} personas` },
    { label: 'Turno 1',      value: `${config.turnoT1Inicio} – ${config.turnoT1Fin}` },
    { label: 'Turno 2',      value: `${config.turnoT2Inicio} – ${config.turnoT2Fin}` },
  ]

  return (
    <ModuleCard
      icon={Clock}
      color="bg-blue-50 text-blue-600"
      title="Horarios de operación"
      description="Apertura, cierre, días, aforo y turnos de atención"
      editSize="sm:max-w-xl"
      summary={summary}
      viewContent={<ReadOnlyList items={viewItems} />}
      editContent={<OperacionForm config={config} idSede={idSede} />}
      navProps={navProps}
    />
  )
}
