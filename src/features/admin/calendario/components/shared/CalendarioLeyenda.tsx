import React from 'react'
import { cn } from '@/lib/utils'

const items = [
  { color: 'bg-white border border-gray-200', label: 'Sin actividad' },
  { color: 'bg-green-50/60 border border-green-200', label: 'Baja ocupacion' },
  {
    color: 'bg-yellow-50/60 border border-yellow-200',
    label: 'Media ocupacion',
  },
  {
    color: 'bg-orange-50/60 border border-orange-200',
    label: 'Alta ocupacion',
  },
  { color: 'bg-red-50 border border-red-200', label: 'Aforo completo' },
  {
    color: 'bg-brand-rosa/4 border border-brand-rosa/20',
    label: 'Evento parcial',
  },
  {
    color: 'bg-brand-rosa/8 border border-brand-rosa/40',
    label: 'Evento lleno',
  },
  { color: 'bg-red-50 border border-red-300', label: 'Bloqueado' },
  { color: 'bg-purple-50 border border-purple-200', label: 'Feriado' },
  {
    color: 'bg-brand-azul/5 border border-brand-azul/20',
    label: 'Programacion activa',
  },
  { color: 'bg-brand-azul/5 border border-brand-azul/40', label: 'Hoy' },
]

export const CalendarioLeyenda = React.memo(() => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
      {items.map(({ color, label }) => (
        <span
          key={label}
          className="flex items-center gap-1.5 text-[11px] text-gray-500"
        >
          <span className={cn('h-3 w-3 rounded-sm shrink-0', color)} />
          {label}
        </span>
      ))}
    </div>
  )
})

CalendarioLeyenda.displayName = 'CalendarioLeyenda'
