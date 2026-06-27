'use client'

import { MESES } from '@/lib/finance-constants'

interface Props {
  anio: number
  mes: number
  onAnio: (v: number) => void
  onMes: (v: number) => void
}

export function PeriodoSelector({ anio, mes, onAnio, onMes }: Props) {
  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  return (
    <div className="flex items-center gap-2">
      <select
        value={mes}
        onChange={(e) => onMes(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
      >
        {MESES.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>
      <select
        value={anio}
        onChange={(e) => onAnio(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
      >
        {anios.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  )
}
