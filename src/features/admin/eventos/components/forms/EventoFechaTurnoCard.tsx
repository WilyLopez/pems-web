'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Clock } from 'lucide-react'
import { Turno } from '../../types'
import { SelectorTurnoInline } from './SelectorTurnoInline'

interface EventoFechaTurnoCardProps {
  fechaParam: string
  turnoActual: Turno | undefined
  idSede: number
  idTurnoSel: number | null
  onTurnoChange: (idTurno: number) => void
}

export function EventoFechaTurnoCard({
  fechaParam,
  turnoActual,
  idSede,
  idTurnoSel,
  onTurnoChange,
}: EventoFechaTurnoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-wrap gap-5">
      <div className="flex items-center gap-2 text-sm">
        <CalendarDays className="h-4 w-4 text-brand-azul" />
        <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
          {format(parseISO(fechaParam), "EEEE d 'de' MMMM yyyy", {
            locale: es,
          })}
        </span>
      </div>
      {turnoActual && (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-brand-azul" />
          <span className="text-gray-600 dark:text-gray-400">
            {turnoActual.nombre} · {turnoActual.horaInicio}–
            {turnoActual.horaFin}
          </span>
          {idTurnoSel && (
            <SelectorTurnoInline
              idSede={idSede}
              fecha={fechaParam}
              idTurnoSel={idTurnoSel}
              onTurnoChange={onTurnoChange}
            />
          )}
        </div>
      )}
    </div>
  )
}
