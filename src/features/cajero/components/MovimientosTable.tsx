'use client'

import { MovimientoCaja } from '@/features/admin/finance'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  movimientos: MovimientoCaja[]
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export function MovimientosTable({ movimientos }: Props) {
  if (movimientos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">Sin movimientos registrados.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 font-semibold">Hora</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Concepto</th>
            <th className="px-4 py-3 font-semibold">Medio de pago</th>
            <th className="px-4 py-3 font-semibold">Origen</th>
            <th className="px-4 py-3 font-semibold text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {movimientos.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">
                {formatHora(m.fechaCreacion)}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                  m.tipo === 'INGRESO'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-600',
                )}>
                  {m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-800">{m.concepto}</td>
              <td className="px-4 py-3 text-gray-500">{m.medioPago ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                  m.esManual
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500',
                )}>
                  {m.esManual ? 'Manual' : 'Automático'}
                </span>
              </td>
              <td className={cn(
                'px-4 py-3 text-right font-semibold tabular-nums',
                m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-500',
              )}>
                {m.tipo === 'EGRESO' ? '-' : '+'}{formatCurrency(m.monto)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 bg-gray-50">
          <tr>
            <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Balance neto
            </td>
            <td className="px-4 py-3 text-right text-sm font-black tabular-nums">
              {(() => {
                const neto = movimientos.reduce(
                  (acc, m) => m.tipo === 'INGRESO' ? acc + m.monto : acc - m.monto,
                  0,
                )
                return (
                  <span className={neto >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                    {neto >= 0 ? '+' : ''}{formatCurrency(neto)}
                  </span>
                )
              })()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
