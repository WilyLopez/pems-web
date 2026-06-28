'use client'

import { Sun, Sunset } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BotonTurnoProps {
  label: string
  horario: string
  turnoKey: 'T1' | 'T2'
  disponible: boolean
  seleccionado: boolean
  onClick: () => void
}

export function BotonTurno({
  label,
  horario,
  turnoKey,
  disponible,
  seleccionado,
  onClick,
}: BotonTurnoProps) {
  const Icon = turnoKey === 'T1' ? Sun : Sunset

  return (
    <button
      type="button"
      disabled={!disponible}
      onClick={onClick}
      className={cn(
        'relative w-full rounded-2xl border-2 p-4 text-left transition-all',
        seleccionado
          ? 'border-brand-rosa bg-brand-rosa/5 dark:bg-brand-rosa/10'
          : disponible
            ? 'border-gray-200 bg-white hover:border-brand-rosa/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-rosa/50'
            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50 dark:border-gray-800 dark:bg-gray-900'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'h-4 w-4',
              seleccionado
                ? 'text-brand-rosa'
                : 'text-gray-400 dark:text-gray-500'
            )}
          />
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {horario}
          </span>
        </div>
        <span
          className={cn(
            'text-[11px] font-bold px-2 py-0.5 rounded-full',
            disponible
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          {disponible ? 'Disponible' : 'No disponible'}
        </span>
      </div>
    </button>
  )
}
