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

const DAYS_HEADER = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

type EstadoDia =
  'pasado' | 'fuera-de-rango' | 'ocupada' | 'muy-proxima' | 'disponible'

interface CalendarioFechaWizardProps {
  fechaSel: string | null
  onSeleccionarFecha: (fecha: string) => void
  fechaMin: string
  fechaMax: string
  fechasOcupadas: Set<string>
}

export function CalendarioFechaWizard({
  fechaSel,
  onSeleccionarFecha,
  fechaMin,
  fechaMax,
  fechasOcupadas,
}: CalendarioFechaWizardProps) {
  const [currentDate, setCurrentDate] = useState(() =>
    parseISO(fechaSel ?? fechaMin)
  )

  const fechaHoy = format(new Date(), 'yyyy-MM-dd')

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })
  const startOffset = getDay(startOfMonth(currentDate))

  // "muy-proxima" queda deliberadamente clickeable (no deshabilitada):
  // permite que el llamador (intentarSeleccionarFecha) siga mostrando el
  // modal de anticipación mínima, en vez de que el calendario la oculte
  // en silencio como si fuera un día ocupado o fuera de rango.
  const estadoDia = (f: string): EstadoDia => {
    if (f < fechaHoy) return 'pasado'
    if (f > fechaMax) return 'fuera-de-rango'
    if (fechasOcupadas.has(f)) return 'ocupada'
    if (f < fechaMin) return 'muy-proxima'
    return 'disponible'
  }

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-gray-900 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand-rosa/40 hover:text-brand-rosa active:scale-95 transition-all"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand-rosa/40 hover:text-brand-rosa active:scale-95 transition-all"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_HEADER.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {days.map((day) => {
          const f = format(day, 'yyyy-MM-dd')
          const estado = estadoDia(f)
          const deshabilitada =
            estado === 'pasado' ||
            estado === 'fuera-de-rango' ||
            estado === 'ocupada'
          const seleccionado = fechaSel === f
          const hoy = isToday(day)

          const etiquetaEstado =
            estado === 'disponible'
              ? 'disponible'
              : estado === 'muy-proxima'
                ? 'muy próxima, requiere más anticipación'
                : 'no disponible'

          return (
            <button
              key={f}
              type="button"
              disabled={deshabilitada}
              aria-pressed={seleccionado}
              aria-label={`${format(day, "d 'de' MMMM", { locale: es })}, ${etiquetaEstado}`}
              onClick={() => onSeleccionarFecha(f)}
              className={cn(
                'h-10 w-full rounded-lg text-sm font-semibold transition-all active:scale-95',
                seleccionado
                  ? 'bg-brand-rosa text-white'
                  : estado === 'disponible'
                    ? 'text-gray-700 hover:bg-brand-rosa/10'
                    : estado === 'muy-proxima'
                      ? 'text-gray-500 hover:bg-gray-50'
                      : 'text-gray-300 cursor-not-allowed',
                hoy &&
                  !seleccionado &&
                  estado === 'disponible' &&
                  'ring-1 ring-brand-azul/40'
              )}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
