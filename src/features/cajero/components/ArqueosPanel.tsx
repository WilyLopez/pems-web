'use client'

import { ArqueoCaja } from '@/features/admin/finanzas'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ClipboardCheck } from 'lucide-react'

interface Props {
  arqueos: ArqueoCaja[]
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ArqueosPanel({ arqueos }: Props) {
  if (arqueos.length === 0) {
    return (
      <div className="py-6 text-center space-y-2">
        <ClipboardCheck className="mx-auto h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">Sin arqueos registrados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {arqueos.map((a) => (
        <div
          key={a.id}
          className="flex items-start justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">
                {formatHora(a.fechaCreacion)}
              </span>
              {a.observaciones && (
                <span className="text-xs text-gray-400 truncate">
                  {a.observaciones}
                </span>
              )}
            </div>
            <div className="text-sm mt-1 flex items-center gap-3">
              <span className="text-gray-500">
                Esperado:{' '}
                <span className="font-semibold text-gray-800">
                  {formatCurrency(a.saldoEsperado)}
                </span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                Contado:{' '}
                <span className="font-semibold text-gray-800">
                  {formatCurrency(a.saldoContado)}
                </span>
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Diferencia
            </p>
            <p
              className={cn(
                'text-sm font-black tabular-nums',
                a.diferencia >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {a.diferencia >= 0 ? '+' : ''}
              {formatCurrency(a.diferencia)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
