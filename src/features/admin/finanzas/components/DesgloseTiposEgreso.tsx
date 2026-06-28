'use client'

import { DesgloseTipoEgreso } from '../types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  desglose: DesgloseTipoEgreso[]
}

const categoriaBadge: Record<string, string> = {
  RECURRENTE_FIJO: 'bg-blue-100 text-blue-700',
  RECURRENTE_VARIABLE: 'bg-yellow-100 text-yellow-700',
  EVENTUAL: 'bg-gray-100 text-gray-600',
}

const categoriaLabel: Record<string, string> = {
  RECURRENTE_FIJO: 'Fijo',
  RECURRENTE_VARIABLE: 'Variable',
  EVENTUAL: 'Eventual',
}

export function DesgloseTiposEgreso({ desglose }: Props) {
  const total = desglose.reduce((acc, d) => acc + d.totalMonto, 0)

  if (desglose.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        Sin egresos registrados.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {desglose.map((item) => {
        const porcentaje = total > 0 ? (item.totalMonto / total) * 100 : 0
        return (
          <li key={item.nombreTipo} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {item.nombreTipo}
                </span>
                <span
                  className={cn(
                    'shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                    categoriaBadge[item.categoria] ??
                      'bg-gray-100 text-gray-600'
                  )}
                >
                  {categoriaLabel[item.categoria] ?? item.categoria}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 shrink-0">
                {formatCurrency(item.totalMonto)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all"
                style={{ width: `${porcentaje.toFixed(1)}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
