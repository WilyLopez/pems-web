'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTesoreriaWeb, useTiposIngreso } from '@/features/admin/finanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { formatCurrency } from '@/lib/utils'
import { MEDIOS_PAGO } from '@/lib/finance-constants'

function primerDiaMes() {
  const hoy = new Date()
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function TesoreriaWebPage() {
  const { idSede } = useAuth()
  const [inicio, setInicio] = useState(primerDiaMes())
  const [fin, setFin] = useState(hoyISO())

  const { data: movimientos = [], isLoading } = useTesoreriaWeb(
    idSede ?? undefined,
    inicio,
    fin
  )
  const { data: tipos = [] } = useTiposIngreso()

  function resolverTipo(codigo: string) {
    return tipos.find((t) => t.codigo === codigo)?.nombre ?? codigo
  }

  function resolverMedio(codigo?: string) {
    return MEDIOS_PAGO.find((m) => m.value === codigo)?.label ?? codigo ?? '—'
  }

  const vigentes = movimientos.filter((m) => m.naturaleza === 'NORMAL')
  const totalVigente = vigentes.reduce((s, m) => s + m.monto, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tesorería Web"
        description="Conciliación de pagos digitales de reservas originadas en el sitio web (nunca afectan una caja física)"
      />

      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className="h-9 w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-azul/10 rounded-xl flex items-center justify-center">
          <Globe className="h-5 w-5 text-brand-azul" />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Total conciliado del período
          </p>
          <p className="text-2xl font-black text-gray-900">
            {formatCurrency(totalVigente)}
          </p>
          <p className="text-xs text-gray-400">
            {vigentes.length} pago{vigentes.length === 1 ? '' : 's'} digital
            {vigentes.length === 1 ? '' : 'es'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Medio de pago</th>
                <th className="px-4 py-3 font-semibold">Reserva</th>
                <th className="px-4 py-3 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : movimientos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    Sin pagos web digitales para este período.
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{m.fecha}</td>
                    <td className="px-4 py-3 text-gray-800">
                      <p
                        className={
                          m.naturaleza !== 'NORMAL'
                            ? 'line-through text-gray-400'
                            : ''
                        }
                      >
                        {resolverTipo(m.tipoIngresoCodigo)}
                      </p>
                      {m.naturaleza === 'CONTRAASIENTO' && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                          Contraasiento
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {resolverMedio(m.medioPago)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.idReservaPublica ? `N° ${m.idReservaPublica}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-azul">
                      {formatCurrency(m.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
