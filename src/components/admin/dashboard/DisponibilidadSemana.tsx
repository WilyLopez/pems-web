'use client'

import { cn, formatDate } from '@/lib/utils'
import { DisponibilidadDia } from '@/types/dashboard.types'

function TurnoChip({ label, disponible }: { label: string; disponible: boolean }) {
  return (
    <span
      className={cn(
        'w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center',
        disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
      )}
    >
      {label}
    </span>
  )
}

interface Props {
  data: DisponibilidadDia[]
}

export function DisponibilidadSemana({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
        Disponibilidad de la semana
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Sin datos de disponibilidad.</p>
      ) : (
        <div className="space-y-2">
          {data.map((dia) => (
            <div
              key={dia.fecha}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <span className="text-sm font-semibold text-gray-700 capitalize">
                {formatDate(dia.fecha, 'EEE d MMM')}
              </span>
              <div className="flex items-center gap-1.5">
                <TurnoChip label="M" disponible={dia.turnoT1Disponible} />
                <TurnoChip label="T" disponible={dia.turnoT2Disponible} />
                {dia.totalEventos > 0 && (
                  <span className="text-[10px] font-bold text-brand-rosa bg-brand-rosa/10 px-1.5 py-0.5 rounded-full">
                    {dia.totalEventos} evento{dia.totalEventos > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
