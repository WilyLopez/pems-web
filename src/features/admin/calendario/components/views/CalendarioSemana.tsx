'use client'

import React from 'react'
import { addDays, eachDayOfInterval, format, isSameDay, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Ticket, PartyPopper } from 'lucide-react'
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

function barColor(pct: number) {
  return pct >= 90
    ? 'bg-red-500'
    : pct >= 70
    ? 'bg-orange-400'
    : pct >= 40
    ? 'bg-yellow-400'
    : 'bg-green-500'
}

export const CalendarioSemana = React.memo(({
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
      <div className="grid grid-cols-7 border-l border-t border-gray-100">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-r border-b border-gray-100 p-2 space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 border-l border-t border-gray-100 animate-fade-in">
      {days.map((day) => {
        const disp = getDisp(day)
        const hoy = isToday(day)
        const pasado = isPast(day)
        const selected = !!selectedDate && isSameDay(selectedDate, day)
        const bloqueado = !!disp && (!disp.accesoPublicoActivo || disp.bloqueadoManualmente)
        const feriado = !!disp?.esFeriado && !bloqueado
        const pct = disp?.ocupacionPorcentaje ?? 0

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'border-r border-b border-gray-100 flex flex-col cursor-pointer transition-colors',
              pasado && !selected && 'opacity-55',
              hoy && !selected && 'bg-brand-azul/5',
              selected && 'bg-brand-azul/8 ring-1 ring-inset ring-brand-azul',
              !hoy && !selected && !pasado && 'hover:bg-gray-50/60'
            )}
            onClick={() => onSelectDay(day)}
          >
            <div
              className={cn(
                'text-center py-3 border-b border-gray-100',
                hoy && 'bg-brand-azul/5'
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {format(day, 'EEE', { locale: es })}
              </p>
              <p
                className={cn(
                  'text-xl font-black mt-0.5',
                  hoy ? 'text-brand-azul' : pasado ? 'text-gray-400' : 'text-gray-900'
                )}
              >
                {format(day, 'd')}
              </p>
            </div>

            <div className="flex-1 p-2 space-y-2 min-h-[420px]">
              {feriado && (
                <span className="inline-block text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded truncate max-w-full">
                  {disp?.descripcionFeriado ?? 'Feriado'}
                </span>
              )}

              {bloqueado ? (
                <div className="flex items-center gap-1 text-red-500 mt-1">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px] font-medium truncate">
                    {disp?.tipoBloqueo?.replace('_', ' ') ?? 'Bloqueado'}
                  </span>
                </div>
              ) : disp ? (
                <>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn('h-1.5 rounded-full transition-all', barColor(pct))}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-0.5">
                    {disp.totalReservas > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 rounded">
                        <Ticket className="h-2 w-2" />
                        {disp.totalReservas}
                      </span>
                    )}
                    {disp.totalEventos > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-pink-700 bg-pink-50 px-1 rounded">
                        <PartyPopper className="h-2 w-2" />
                        {disp.totalEventos}
                      </span>
                    )}
                    {disp.ingresoEstimado > 0 && (
                      <span className="text-[9px] font-bold text-green-700">
                        {formatCurrency(disp.ingresoEstimado, 0)}
                      </span>
                    )}
                  </div>

                </>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
})

CalendarioSemana.displayName = 'CalendarioSemana'
