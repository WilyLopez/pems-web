'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useResumenMensual, useResumenDiario } from '@/hooks/useFinanzas'
import { ResumenMensualCards } from '@/components/admin/finanzas/ResumenMensualCards'
import { DesgloseTiposEgreso } from '@/components/admin/finanzas/DesgloseTiposEgreso'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { formatCurrency } from '@/lib/utils'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function ResumenMensualTab() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const anios = Array.from({ length: 5 }, (_, i) => hoy.getFullYear() - i)

  const { data: resumen, isLoading } = useResumenMensual(
    idSede ?? undefined,
    anio,
    mes
  )

  return (
    <div className="space-y-6">
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : resumen ? (
        <div className="space-y-6">
          <ResumenMensualCards resumen={resumen} />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Desglose por tipo de egreso</h3>
            <DesgloseTiposEgreso desglose={resumen.desglosePorTipoEgreso} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Sin datos para el periodo.</p>
      )}
    </div>
  )
}

function ResumenDiarioTab() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const formatLocal = (d: Date) => d.toISOString().split('T')[0]
  const inicioDefault = formatLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const finDefault = formatLocal(hoy)

  const [inicio, setInicio] = useState(inicioDefault)
  const [fin, setFin] = useState(finDefault)

  const { data: dias = [], isLoading } = useResumenDiario(
    idSede ?? undefined,
    inicio || undefined,
    fin || undefined
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold text-right">Ingresos reservas</th>
              <th className="px-4 py-3 font-semibold text-right">Gastos operativos</th>
              <th className="px-4 py-3 font-semibold text-right">Utilidad</th>
              <th className="px-4 py-3 font-semibold text-right">Reservas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : dias.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                  Sin datos para el rango seleccionado.
                </td>
              </tr>
            ) : (
              dias.map((d) => (
                <tr key={d.fecha} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.fecha}</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                    {formatCurrency(d.ingresoReservas)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {formatCurrency(d.gastoOperativo)}
                  </td>
                  <td className="px-4 py-3 text-right font-black">
                    <span className={d.utilidadDia >= 0 ? 'text-brand-azul' : 'text-red-600'}>
                      {formatCurrency(d.utilidadDia)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{d.cantidadReservas}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes financieros"
        description="Analisis de ingresos, egresos y utilidades"
      />

      <Tabs defaultValue="mensual">
        <TabsList className="mb-4">
          <TabsTrigger value="mensual">Resumen mensual</TabsTrigger>
          <TabsTrigger value="diario">Resumen diario</TabsTrigger>
        </TabsList>

        <TabsContent value="mensual">
          <ResumenMensualTab />
        </TabsContent>

        <TabsContent value="diario">
          <ResumenDiarioTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
