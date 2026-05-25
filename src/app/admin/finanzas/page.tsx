'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useResumenMensual, useEgresosPorPeriodo, useEgresoMutations } from '@/hooks/useFinanzas'
import { ResumenMensualCards } from '@/components/admin/finanzas/ResumenMensualCards'
import { DesgloseTiposEgreso } from '@/components/admin/finanzas/DesgloseTiposEgreso'
import { RegistrarEgresoModal } from '@/components/admin/finanzas/RegistrarEgresoModal'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function FinanzasDashboardPage() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [openModal, setOpenModal] = useState(false)

  const { data: resumen, isLoading } = useResumenMensual(
    idSede ?? undefined,
    anio,
    mes
  )
  const { data: egresos = [] } = useEgresosPorPeriodo(
    idSede ?? undefined,
    anio,
    mes
  )
  const { eliminar } = useEgresoMutations()

  const anios = Array.from({ length: 5 }, (_, i) => hoy.getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader
          title="Finanzas"
          description="Resumen financiero mensual de la sede"
        />
        <div className="flex items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
          >
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
          >
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => setOpenModal(true)}
            className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
          >
            <Plus className="h-4 w-4" />
            Registrar egreso
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : resumen ? (
        <ResumenMensualCards resumen={resumen} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          Sin datos para el periodo seleccionado.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Desglose por tipo de egreso</h3>
          {resumen ? (
            <DesgloseTiposEgreso desglose={resumen.desglosePorTipoEgreso} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Sin datos.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Egresos del periodo</h3>
          {egresos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin egresos registrados.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {egresos.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.nombreTipoEgreso}</p>
                    <p className="text-xs text-gray-400">{e.fecha}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(e.monto)}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminar.mutate(e.id)}
                      disabled={eliminar.isPending}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {idSede && (
        <RegistrarEgresoModal
          open={openModal}
          onOpenChange={setOpenModal}
          idSede={idSede}
        />
      )}
    </div>
  )
}
