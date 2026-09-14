'use client'

import { Undo2 } from 'lucide-react'
import { CategoriaRetiro, MovimientoCaja } from '@/features/admin/finanzas'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  movimientos: MovimientoCaja[]
  onAnular?: (movimiento: MovimientoCaja) => void
}

const CATEGORIA_LABEL: Record<CategoriaRetiro, string> = {
  SERVICIOS: 'Servicios',
  PROVEEDORES: 'Proveedores',
  PERSONAL: 'Personal',
  OPERATIVO: 'Operativo',
  OTRO: 'Otro',
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MovimientosTable({ movimientos, onAnular }: Props) {
  if (movimientos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Sin movimientos registrados.
      </p>
    )
  }

  const idsAnulados = new Set(
    movimientos
      .map((m) => m.idMovimientoAnulado)
      .filter((id): id is number => id != null)
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <th className="px-4 py-3 font-semibold">Hora</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Concepto</th>
            <th className="px-4 py-3 font-semibold">Categoría</th>
            <th className="px-4 py-3 font-semibold">Medio de pago</th>
            <th className="px-4 py-3 font-semibold">Origen</th>
            <th className="px-4 py-3 font-semibold text-right">Monto</th>
            {onAnular && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {movimientos.map((m) => (
            <tr
              key={m.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
            >
              <td
                className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 tabular-nums"
                suppressHydrationWarning
              >
                {formatHora(m.fechaCreacion)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                    m.tipo === 'INGRESO'
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  )}
                >
                  {m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                <span
                  className={cn(
                    idsAnulados.has(m.id) &&
                      'line-through text-gray-400 dark:text-gray-500'
                  )}
                >
                  {m.concepto}
                </span>
                {m.naturaleza === 'CONTRAASIENTO' && (
                  <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    Contraasiento
                  </span>
                )}
                {idsAnulados.has(m.id) && (
                  <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                    Anulado
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {m.categoriaRetiro ? (
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">
                    {CATEGORIA_LABEL[m.categoriaRetiro]}
                  </span>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {m.medioPago ?? '—'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                    m.esManual
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {m.esManual ? 'Manual' : 'Automático'}
                </span>
              </td>
              <td
                className={cn(
                  'px-4 py-3 text-right font-semibold tabular-nums',
                  m.tipo === 'INGRESO'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                )}
              >
                {m.tipo === 'EGRESO' ? '-' : '+'}
                {formatCurrency(m.monto)}
              </td>
              {onAnular && (
                <td className="px-4 py-3 text-right">
                  {m.naturaleza !== 'CONTRAASIENTO' &&
                    !idsAnulados.has(m.id) && (
                      <button
                        type="button"
                        onClick={() => onAnular(m)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Anular
                      </button>
                    )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <td
              colSpan={onAnular ? 7 : 6}
              className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Balance neto
            </td>
            <td className="px-4 py-3 text-right text-sm font-black tabular-nums">
              {(() => {
                const neto = movimientos.reduce(
                  (acc, m) =>
                    m.tipo === 'INGRESO' ? acc + m.monto : acc - m.monto,
                  0
                )
                return (
                  <span
                    className={
                      neto >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }
                  >
                    {neto >= 0 ? '+' : ''}
                    {formatCurrency(neto)}
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
