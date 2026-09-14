'use client'

import { useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDisponibilidadRango } from '@/features/admin/calendario/hooks/useCalendarData'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { fechaHoyEnZonaNegocio, cn } from '@/lib/utils'

function estadoDia(d?: Disponibilidad) {
  if (!d) return null
  if (d.bloqueadoManualmente)
    return {
      label: 'Bloqueado',
      dot: 'bg-gray-400',
      text: 'text-gray-700 dark:text-gray-300',
      bg: 'bg-gray-100 dark:bg-gray-800',
    }
  if (d.esFeriado)
    return {
      label: d.descripcionFeriado || 'Feriado',
      dot: 'bg-red-400',
      text: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
    }
  if (d.tipoOcupacion === 'PRIVADO_LLENO')
    return {
      label: 'Evento privado — todo el día',
      dot: 'bg-violet-500',
      text: 'text-violet-700 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    }
  if (d.tipoOcupacion === 'PRIVADO_PARCIAL')
    return {
      label: 'Evento privado — parcial',
      dot: 'bg-violet-400',
      text: 'text-violet-700 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    }
  if (d.aforoCompleto)
    return {
      label: 'Aforo completo',
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    }
  return {
    label: 'Disponible',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  }
}

const TURNOS = [
  { key: 'T1', label: 'Turno 1 — Mañana' },
  { key: 'T2', label: 'Turno 2 — Tarde' },
] as const

export default function CajeroCalendarioPage() {
  const { idSede } = useAuth()
  const hoy = fechaHoyEnZonaNegocio()
  const [weekOffset, setWeekOffset] = useState(0)
  const [fechaSel, setFechaSel] = useState(hoy)

  const inicioSemana = useMemo(
    () =>
      format(
        addDays(
          startOfWeek(new Date(`${hoy}T00:00:00`), { weekStartsOn: 1 }),
          weekOffset * 7
        ),
        'yyyy-MM-dd'
      ),
    [hoy, weekOffset]
  )
  const finSemana = useMemo(
    () =>
      format(addDays(new Date(`${inicioSemana}T00:00:00`), 6), 'yyyy-MM-dd'),
    [inicioSemana]
  )

  const { data: semana, isLoading } = useDisponibilidadRango(
    idSede ?? 0,
    inicioSemana,
    finSemana
  )

  const diaSeleccionado = semana?.find((d) => d.fecha === fechaSel)
  const estado = estadoDia(diaSeleccionado)

  function cambiarSemana(delta: number) {
    const nuevoOffset = Math.max(0, weekOffset + delta)
    setWeekOffset(nuevoOffset)
    setFechaSel(
      format(
        addDays(
          startOfWeek(new Date(`${hoy}T00:00:00`), { weekStartsOn: 1 }),
          nuevoOffset * 7
        ),
        'yyyy-MM-dd'
      )
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader
        title="Calendario"
        description="Disponibilidad y aforo de la semana"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {format(new Date(`${inicioSemana}T00:00:00`), "d 'de' MMM", {
            locale: es,
          })}{' '}
          –{' '}
          {format(new Date(`${finSemana}T00:00:00`), "d 'de' MMM", {
            locale: es,
          })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => cambiarSemana(-1)}
            disabled={weekOffset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => cambiarSemana(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {semana?.map((d) => {
            const est = estadoDia(d)
            const seleccionado = d.fecha === fechaSel
            const esHoy = d.fecha === hoy
            const date = new Date(`${d.fecha}T00:00:00`)
            return (
              <button
                key={d.fecha}
                onClick={() => setFechaSel(d.fecha)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all',
                  seleccionado
                    ? 'border-brand-azul bg-brand-azul/5 dark:bg-brand-azul/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                )}
              >
                <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">
                  {format(date, 'EEE', { locale: es })}
                </span>
                <span
                  className={cn(
                    'text-lg font-black',
                    esHoy
                      ? 'text-brand-azul'
                      : 'text-gray-900 dark:text-gray-100'
                  )}
                >
                  {format(date, 'd')}
                </span>
                <span className={cn('h-1.5 w-1.5 rounded-full', est?.dot)} />
              </button>
            )
          })}
        </div>
      )}

      {diaSeleccionado && estado && (
        <div className="space-y-3">
          <div
            className={cn(
              'rounded-2xl border p-5 dark:border-gray-800',
              estado.bg
            )}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {format(
                    new Date(`${fechaSel}T00:00:00`),
                    "EEEE d 'de' MMMM",
                    { locale: es }
                  )}
                </p>
                {diaSeleccionado.tituloEvento && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {diaSeleccionado.tituloEvento}
                  </p>
                )}
                {diaSeleccionado.motivoBloqueo && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {diaSeleccionado.motivoBloqueo}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-full shrink-0',
                  estado.text
                )}
              >
                {estado.label}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-700 dark:text-gray-300">
                Aforo público
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {diaSeleccionado.aforoPublicoActual}/
                {diaSeleccionado.aforoMaximo}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  diaSeleccionado.aforoCompleto
                    ? 'bg-amber-500'
                    : 'bg-brand-azul'
                )}
                style={{
                  width: `${Math.min(100, diaSeleccionado.ocupacionPorcentaje)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {diaSeleccionado.plazasDisponibles} plazas libres ·{' '}
              {diaSeleccionado.totalReservas} reservas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TURNOS.map(({ key, label }) => {
              const disponible =
                key === 'T1'
                  ? diaSeleccionado.turnoT1Disponible
                  : diaSeleccionado.turnoT2Disponible
              const ocupado =
                key === 'T1'
                  ? diaSeleccionado.turnoT1Ocupado
                  : diaSeleccionado.turnoT2Ocupado
              const evento =
                key === 'T1'
                  ? diaSeleccionado.tituloEventoT1
                  : diaSeleccionado.tituloEventoT2
              return (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
                >
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                  </p>
                  {evento ? (
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                      {evento}
                    </p>
                  ) : disponible && !ocupado ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Disponible
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No disponible
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
