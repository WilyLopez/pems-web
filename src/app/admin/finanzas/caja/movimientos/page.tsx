'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCaja, useMovimientosCaja } from '@/hooks/useFinanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function MovimientosCajaPage() {
  const { idSede }             = useAuth()
  const [fecha, setFecha]      = useState(new Date().toISOString().slice(0, 10))

  const { data: caja, isLoading: loadingCaja } = useCaja(idSede ?? undefined, fecha)
  const { data: movimientos = [], isLoading: loadingMov } = useMovimientosCaja(caja?.id)

  const isLoading = loadingCaja || loadingMov

  const totalIngresos = movimientos.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + m.monto, 0)
  const totalEgresos  = movimientos.filter((m) => m.tipo === 'EGRESO').reduce((s, m) => s + m.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Historial de movimientos" description="Movimientos registrados en la caja para una fecha" />
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-9 w-40" />
      </div>

      {!isLoading && !caja && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          No hay caja registrada para la fecha seleccionada.
        </div>
      )}

      {caja && (
        <>
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 flex items-center gap-2">
              <span className="text-gray-500">Total ingresos:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(totalIngresos)}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 flex items-center gap-2">
              <span className="text-gray-500">Total egresos:</span>
              <span className="font-semibold text-red-500">{formatCurrency(totalEgresos)}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 flex items-center gap-2">
              <span className="text-gray-500">Neto:</span>
              <span className={cn('font-semibold', totalIngresos - totalEgresos >= 0 ? 'text-brand-azul' : 'text-red-500')}>
                {formatCurrency(totalIngresos - totalEgresos)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Concepto</th>
                    <th className="px-4 py-3 font-semibold">Medio de pago</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold">Registrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}</tr>
                    ))
                  ) : movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                        Sin movimientos para esta caja.
                      </td>
                    </tr>
                  ) : movimientos.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                          m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        )}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{m.concepto}</td>
                      <td className="px-4 py-3 text-gray-500">{m.medioPago ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{m.esManual ? 'Manual' : 'Automático'}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold', m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-500')}>
                        {m.tipo === 'EGRESO' ? '-' : ''}{formatCurrency(m.monto)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(m.fechaCreacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
