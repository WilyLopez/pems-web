'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useResumenMensual,
  useResumenDiario,
  useMetricasReservas,
} from '@/hooks/useFinanzas'
import { ResumenMensualCards } from '@/components/admin/finanzas/ResumenMensualCards'
import { DesgloseTiposEgreso } from '@/components/admin/finanzas/DesgloseTiposEgreso'
import { GraficaLineaDiaria } from '@/components/admin/finanzas/GraficaLineaDiaria'
import { MetricasReservasSection } from '@/components/admin/finanzas/MetricasReservasSection'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { formatCurrency, exportarCSV } from '@/lib/utils'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function PeriodoSelector({
  anio,
  mes,
  onAnio,
  onMes,
}: {
  anio: number
  mes: number
  onAnio: (v: number) => void
  onMes: (v: number) => void
}) {
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

function ResumenMensualTab() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)

  const { data: resumen, isLoading } = useResumenMensual(idSede ?? undefined, anio, mes)

  return (
    <div className="space-y-6">
      <PeriodoSelector anio={anio} mes={mes} onAnio={setAnio} onMes={setMes} />

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
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const [inicio, setInicio] = useState(fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)))
  const [fin, setFin] = useState(fmt(hoy))

  const debouncedInicio = useDebounce(inicio, 500)
  const debouncedFin = useDebounce(fin, 500)

  const { data: dias = [], isLoading } = useResumenDiario(
    idSede ?? null,
    debouncedInicio || null,
    debouncedFin || null,
  )

  const handleExportar = () => {
    exportarCSV(`reporte-diario-${debouncedInicio}-${debouncedFin}.csv`, dias.map((d) => ({
      Fecha: d.fecha,
      'Ingresos reservas': d.ingresoReservas,
      'Gastos operativos': d.gastoOperativo,
      'Utilidad dia': d.utilidadDia,
      'Cantidad reservas': d.cantidadReservas,
      'Ticket promedio': d.ticketPromedio,
    })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="h-9 w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="h-9 w-40" />
          </div>
        </div>
        {dias.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleExportar} className="gap-1.5">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {dias.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Tendencia del periodo</p>
          <GraficaLineaDiaria dias={dias} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold text-right">Ingresos</th>
              <th className="px-4 py-3 font-semibold text-right">Gastos</th>
              <th className="px-4 py-3 font-semibold text-right">Utilidad</th>
              <th className="px-4 py-3 font-semibold text-right">Reservas</th>
              <th className="px-4 py-3 font-semibold text-right">Ticket prom.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : dias.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
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
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatCurrency(d.ticketPromedio)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricasReservasTab() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)

  const { data: metricas, isLoading } = useMetricasReservas(idSede ?? undefined, anio, mes)

  return (
    <div className="space-y-6">
      <PeriodoSelector anio={anio} mes={mes} onAnio={setAnio} onMes={setMes} />

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : metricas ? (
        <MetricasReservasSection metricas={metricas} />
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Sin datos para el periodo.</p>
      )}
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
          <TabsTrigger value="metricas">Metricas de reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="mensual">
          <ResumenMensualTab />
        </TabsContent>

        <TabsContent value="diario">
          <ResumenDiarioTab />
        </TabsContent>

        <TabsContent value="metricas">
          <MetricasReservasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
