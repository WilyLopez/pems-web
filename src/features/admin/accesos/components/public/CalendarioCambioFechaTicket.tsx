'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'

const DAYS_HEADER = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props {
  idSede: number
  fechaSel: string
  onSeleccionarFecha: (fecha: string) => void
  fechaMin: string
  fechaMax: string
}

export function CalendarioCambioFechaTicket({
  idSede,
  fechaSel,
  onSeleccionarFecha,
  fechaMin,
  fechaMax,
}: Props) {
  const [currentDate, setCurrentDate] = useState(() =>
    parseISO(fechaSel || fechaMin)
  )

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(
    idSede,
    fechaMin,
    fechaMax
  )

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })
  const startOffset = getDay(startOfMonth(currentDate))

  const puedeIrAnterior =
    format(endOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd') >= fechaMin
  const puedeIrSiguiente =
    format(startOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd') <= fechaMax

  const esFechaHabilitada = (day: Date): boolean => {
    const f = format(day, 'yyyy-MM-dd')
    if (f < fechaMin || f > fechaMax) return false
    const disp = disponibilidades?.find((d) => d.fecha === f)
    if (!disp) return false
    return disp.disponiblePublico
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!puedeIrAnterior}
            className="h-7 w-7 rounded-lg dark:border-gray-700 dark:text-gray-300"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!puedeIrSiguiente}
            className="h-7 w-7 rounded-lg dark:border-gray-700 dark:text-gray-300"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAYS_HEADER.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} className="h-9" />
          ))}
          {days.map((day) => {
            const f = format(day, 'yyyy-MM-dd')
            const habilitado = esFechaHabilitada(day)
            const seleccionado = fechaSel === f
            const hoy = isToday(day)
            const etiquetaDia = format(day, "d 'de' MMMM", { locale: es })
            return (
              <button
                key={f}
                type="button"
                disabled={!habilitado}
                aria-pressed={seleccionado}
                aria-label={`${etiquetaDia}, ${habilitado ? 'disponible' : 'no disponible'}`}
                onClick={() => onSeleccionarFecha(f)}
                className={cn(
                  'h-9 w-full rounded-lg border text-xs font-semibold transition-all',
                  seleccionado
                    ? 'bg-brand-rosa text-white border-brand-rosa'
                    : habilitado
                      ? 'border-gray-200 hover:border-brand-rosa/50 hover:bg-brand-rosa/5 text-gray-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-brand-rosa/50 dark:hover:bg-brand-rosa/10'
                      : 'border-transparent bg-gray-50/60 text-gray-300 cursor-not-allowed dark:bg-gray-800/60 dark:text-gray-600',
                  hoy &&
                    !seleccionado &&
                    habilitado &&
                    'ring-1 ring-brand-azul/40'
                )}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
