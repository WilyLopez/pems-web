'use client'

import React from 'react'
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Sun, Sunset, Ticket, PartyPopper } from 'lucide-react'
import { Disponibilidad } from '../../types'
import { cn, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { isPast } from '../../utils/date-helpers'

interface CalendarioSemanaProps {
  semanaInicio: Date
  disponibilidades: Disponibilidad[]
  isLoading: boolean
  selectedDate: Date | null
  onSelectDay: (day: Date) => void
}

function TurnoSlot({
  icon: Icon,
  label,
  titulo,
  ocupado,
  pasado,
}: {
  icon: React.ElementType
  label: string
  titulo?: string | null
  ocupado: boolean
  pasado: boolean
}) {
  if (!ocupado) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <Icon className="h-3 w-3 text-gray-300 shrink-0" />
        <span className="text-[10px] text-gray-300 font-medium">{label}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-1.5 px-2 py-1.5 bg-brand-rosa/8 border-l-2 border-brand-rosa/50">
      <Icon className="h-3 w-3 text-brand-rosa shrink-0 mt-0.5" />
      <span className="text-[10px] font-semibold text-brand-rosa leading-tight truncate">
        {titulo ?? (pasado ? 'Evento' : 'Evento privado')}
      </span>
    </div>
  )
}

function barColor(pct: number) {
  return pct >= 90
    ? 'bg-red-500'
    : pct >= 70
      ? 'bg-orange-400'
      : pct >= 40
        ? 'bg-yellow-400'
        : 'bg-green-500'
}

export const CalendarioSemana = React.memo(
  ({
    semanaInicio,
    disponibilidades,
    isLoading,
    selectedDate,
    onSelectDay,
  }: CalendarioSemanaProps) => {
    const days = eachDayOfInterval({
      start: semanaInicio,
      end: addDays(semanaInicio, 6),
    })

    const getDisp = (day: Date): Disponibilidad | undefined =>
      disponibilidades.find((d) => isSameDay(parseISO(d.fecha), day))

    if (isLoading) {
      return (
        <div className="grid grid-cols-7 border-l border-t border-gray-100 rounded-xl overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="border-r border-b border-gray-100 p-2 space-y-2"
            >
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-7 border-l border-t border-gray-100 rounded-xl overflow-hidden animate-fade-in">
        {days.map((day) => {
          const disp = getDisp(day)
          const hoy = isToday(day)
          const pasado = isPast(day)
          const selected = !!selectedDate && isSameDay(selectedDate, day)
          const bloqueado = disp?.tipoOcupacion === 'BLOQUEADO'
          const feriado = disp?.esFeriado || disp?.tipoDia === 'FERIADO'
          const esPrivado =
            disp?.tipoOcupacion === 'PRIVADO_PARCIAL' ||
            disp?.tipoOcupacion === 'PRIVADO_LLENO'
          const pct = disp?.ocupacionPorcentaje ?? 0
          const tieneReservas = (disp?.totalReservas ?? 0) > 0

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-r border-b border-gray-100 flex flex-col cursor-pointer transition-colors select-none',
                pasado && !selected && 'opacity-55',
                hoy && !selected && 'bg-brand-azul/5',
                selected && 'bg-brand-azul/8 ring-1 ring-inset ring-brand-azul',
                !hoy && !selected && !pasado && 'hover:bg-gray-50/60'
              )}
              onClick={() => onSelectDay(day)}
            >
              <div
                className={cn(
                  'text-center px-2 py-2.5 border-b border-gray-100',
                  hoy && 'bg-brand-azul/5'
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 capitalize">
                  {format(day, 'EEE', { locale: es })}
                </p>
                <div className="flex items-center justify-center mt-0.5">
                  <span
                    className={cn(
                      'text-lg font-black leading-none inline-flex items-center justify-center',
                      hoy
                        ? 'h-7 w-7 rounded-full bg-brand-azul text-white text-sm'
                        : pasado
                          ? 'text-gray-400'
                          : feriado
                            ? 'text-purple-700 dark:text-purple-400'
                            : bloqueado
                              ? 'text-red-500'
                              : 'text-gray-900'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {feriado && (
                  <div className="px-2 pt-2">
                    <span className="inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded truncate max-w-full">
                      {disp?.descripcionFeriado ?? 'Feriado'}
                    </span>
                  </div>
                )}

                {bloqueado && (
                  <div className="flex items-center gap-1 px-2 pt-2 text-red-500">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span className="text-[10px] font-medium truncate">
                      {disp?.motivoBloqueo ??
                        disp?.tipoBloqueo?.replace(/_/g, ' ') ??
                        'Bloqueado'}
                    </span>
                  </div>
                )}

                {!bloqueado && disp && (
                  <>
                    {!esPrivado && tieneReservas && (
                      <div className="px-2 pt-2 space-y-1.5">
                        <div className="h-1 w-full rounded-full bg-gray-100">
                          <div
                            className={cn(
                              'h-1 rounded-full transition-all',
                              barColor(pct)
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 rounded">
                            <Ticket className="h-2.5 w-2.5" />
                            {disp.totalReservas} reservas
                          </span>
                          {(disp.ingresoEstimado ?? 0) > 0 && (
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 tabular-nums">
                              {formatCurrency(disp.ingresoEstimado, 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!esPrivado && !tieneReservas && !pasado && (
                      <div className="px-2 pt-2">
                        <span className="text-[10px] text-gray-300 font-medium">
                          Sin actividad
                        </span>
                      </div>
                    )}

                    <div className="mt-auto divide-y divide-gray-100">
                      <TurnoSlot
                        icon={Sun}
                        label="Mañana"
                        titulo={disp.tituloEventoT1}
                        ocupado={!!disp.turnoT1Ocupado}
                        pasado={pasado}
                      />
                      <TurnoSlot
                        icon={Sunset}
                        label="Tarde"
                        titulo={disp.tituloEventoT2}
                        ocupado={!!disp.turnoT2Ocupado}
                        pasado={pasado}
                      />
                    </div>

                    {esPrivado && (disp.ingresoEstimado ?? 0) > 0 && (
                      <div className="px-2 pb-1.5 flex items-center gap-1">
                        <PartyPopper className="h-2.5 w-2.5 text-brand-rosa" />
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 tabular-nums">
                          {formatCurrency(disp.ingresoEstimado, 0)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {!disp && !isLoading && (
                  <div className="px-2 pt-2 divide-y divide-gray-100 mt-auto">
                    <TurnoSlot
                      icon={Sun}
                      label="Mañana"
                      titulo={null}
                      ocupado={false}
                      pasado={pasado}
                    />
                    <TurnoSlot
                      icon={Sunset}
                      label="Tarde"
                      titulo={null}
                      ocupado={false}
                      pasado={pasado}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

CalendarioSemana.displayName = 'CalendarioSemana'
