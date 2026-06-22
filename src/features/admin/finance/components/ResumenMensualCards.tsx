'use client'

import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { ResumenFinanciero } from '../types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  resumen: ResumenFinanciero
}

export function ResumenMensualCards({ resumen }: Props) {
  const margen =
    resumen.totalIngresoGeneral > 0
      ? (resumen.utilidadNeta / resumen.totalIngresoGeneral) * 100
      : 0

  const positivo = resumen.utilidadNeta >= 0

  const cards = [
    {
      label: 'Total ingresos',
      value: formatCurrency(resumen.totalIngresoGeneral),
      sub: `Reservas: ${formatCurrency(resumen.totalIngresoReservas)} · Adelantos: ${formatCurrency(resumen.totalAdelantoEventos)}`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total egresos',
      value: formatCurrency(resumen.totalEgresoNeto),
      sub: `General: ${formatCurrency(resumen.totalEgresoGeneral)} · Operativo: ${formatCurrency(resumen.totalEgresoOperativo)}`,
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Utilidad neta',
      value: formatCurrency(resumen.utilidadNeta),
      sub: positivo ? 'Resultado positivo' : 'Resultado negativo',
      icon: DollarSign,
      color: positivo ? 'bg-brand-azul/10 text-brand-azul' : 'bg-red-100 text-red-600',
      valueClass: positivo ? 'text-brand-azul' : 'text-red-600',
    },
    {
      label: 'Margen',
      value: `${margen.toFixed(1)}%`,
      sub: 'Sobre ingresos totales',
      icon: BarChart3,
      color: 'bg-brand-amarillo/20 text-yellow-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, valueClass }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
        >
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className={cn('text-2xl font-black', valueClass ?? 'text-gray-900')}>{value}</p>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
