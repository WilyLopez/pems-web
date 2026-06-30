'use client'

import { cn, formatDate } from '@/lib/utils'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { EmptyState } from '../../shared/components/EmptyState'
import { DisponibilidadDia } from '../../shared/types'

function TurnoChip({
  label,
  disponible,
}: {
  label: string
  disponible: boolean
}) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold',
        disponible
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
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
    <DashboardCard>
      <h3 className="mb-4 text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
        Disponibilidad de la semana
      </h3>
      {data.length === 0 ? (
        <EmptyState mensaje="Sin datos de disponibilidad." />
      ) : (
        <div className="space-y-2">
          {data.map((dia) => (
            <div
              key={dia.fecha}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <span className="text-sm font-semibold capitalize text-gray-700 dark:text-gray-300">
                {formatDate(dia.fecha, 'EEE d MMM')}
              </span>
              <div className="flex items-center gap-1.5">
                <TurnoChip label="M" disponible={dia.turnoT1Disponible} />
                <TurnoChip label="T" disponible={dia.turnoT2Disponible} />
                {dia.totalEventos > 0 && (
                  <span className="rounded-full bg-brand-rosa/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-rosa">
                    {dia.totalEventos} evento{dia.totalEventos > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
