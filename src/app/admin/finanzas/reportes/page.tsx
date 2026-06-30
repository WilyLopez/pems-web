'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Download, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useResumenMensual,
  useResumenDiario,
  useMetricasReservas,
  ResumenMensualCards,
  DesgloseTiposEgreso,
  GraficaLineaDiaria,
  MetricasReservasSection,
  GraficoEgresosMensual,
} from '@/features/admin/finanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { formatCurrency, exportarCSV, cn } from '@/lib/utils'
import { MESES } from '@/lib/finance-constants'

const hoy = new Date()
const DEFAULT_TAB = 'mensual'
const DEFAULT_ANIO = hoy.getFullYear()
const DEFAULT_MES = hoy.getMonth() + 1
const DEFAULT_DESDE = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
const DEFAULT_HASTA = hoy.toISOString().split('T')[0]

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
  const anios = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  )
  return (
    <div className="flex items-center gap-2">
      <select
        value={mes}
        onChange={(e) => onMes(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
      >
        {MESES.map((m, i) => (
          <option key={i + 1} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={anio}
        onChange={(e) => onAnio(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
      >
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  )
}

function ResumenMensualTab({
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
  const { idSede } = useAuth()
  const { data: resumen, isLoading, refetch, isFetching } = useResumenMensual(
    idSede ?? undefined,
    anio,
    mes
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PeriodoSelector anio={anio} mes={mes} onAnio={onAnio} onMes={onMes} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : resumen ? (
        <div className="space-y-6">
          <ResumenMensualCards resumen={resumen} />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Desglose y composición de egresos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <GraficoEgresosMensual desglose={resumen.desglosePorTipoEgreso} />
              <DesgloseTiposEgreso desglose={resumen.desglosePorTipoEgreso} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          Sin datos para el periodo.
        </p>
      )}
    </div>
  )
}

function ResumenDiarioTab({
  desde,
  hasta,
  onDesde,
  onHasta,
}: {
  desde: string
  hasta: string
  onDesde: (v: string) => void
  onHasta: (v: string) => void
}) {
  const { idSede } = useAuth()

  const debouncedDesde = useDebounce(desde, 500)
  const debouncedHasta = useDebounce(hasta, 500)

  const { data: dias = [], isLoading, refetch, isFetching } = useResumenDiario(
    idSede ?? null,
    debouncedDesde || null,
    debouncedHasta || null
  )

  const handleExportar = () => {
    exportarCSV(
      `reporte-diario-${debouncedDesde}-${debouncedHasta}.csv`,
      dias.map((d) => ({
        Fecha: d.fecha,
        'Ingresos reservas': d.ingresoReservas,
        'Gastos operativos': d.gastoOperativo,
        'Utilidad dia': d.utilidadDia,
        'Cantidad reservas': d.cantidadReservas,
        'Ticket promedio': d.ticketPromedio,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              value={desde}
              onChange={(e) => onDesde(e.target.value)}
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => onHasta(e.target.value)}
              className="h-9 w-40"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            Actualizar
          </Button>
          {dias.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportar}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {dias.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Tendencia del periodo
          </p>
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
              <th className="px-4 py-3 font-semibold text-right">
                Ticket prom.
              </th>
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
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-gray-400"
                >
                  Sin datos para el rango seleccionado.
                </td>
              </tr>
            ) : (
              dias.map((d) => (
                <tr
                  key={d.fecha}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {d.fecha}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                    {formatCurrency(d.ingresoReservas)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {formatCurrency(d.gastoOperativo)}
                  </td>
                  <td className="px-4 py-3 text-right font-black">
                    <span
                      className={
                        d.utilidadDia >= 0 ? 'text-brand-azul' : 'text-red-600'
                      }
                    >
                      {formatCurrency(d.utilidadDia)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {d.cantidadReservas}
                  </td>
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

function MetricasReservasTab({
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
  const { idSede } = useAuth()
  const { data: metricas, isLoading, refetch, isFetching } = useMetricasReservas(
    idSede ?? undefined,
    anio,
    mes
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PeriodoSelector anio={anio} mes={mes} onAnio={onAnio} onMes={onMes} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : metricas ? (
        <MetricasReservasSection metricas={metricas} />
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          Sin datos para el periodo.
        </p>
      )}
    </div>
  )
}

export default function ReportesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') ?? DEFAULT_TAB
  const anio = Number(searchParams.get('anio')) || DEFAULT_ANIO
  const mes = Number(searchParams.get('mes')) || DEFAULT_MES
  const desde = searchParams.get('desde') ?? DEFAULT_DESDE
  const hasta = searchParams.get('hasta') ?? DEFAULT_HASTA

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params}`)
    },
    [searchParams, router, pathname]
  )

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('tab', value)
      router.push(`${pathname}?${params}`)
    },
    [searchParams, router, pathname]
  )

  const setPeriodo = useCallback(
    (newAnio: number, newMes: number) => {
      const params = new URLSearchParams(searchParams)
      params.set('anio', String(newAnio))
      params.set('mes', String(newMes))
      router.push(`${pathname}?${params}`)
    },
    [searchParams, router, pathname]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes financieros"
        description="Analisis de ingresos, egresos y utilidades"
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="mensual">Resumen mensual</TabsTrigger>
          <TabsTrigger value="diario">Resumen diario</TabsTrigger>
          <TabsTrigger value="metricas">Metricas de reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="mensual">
          <ResumenMensualTab
            anio={anio}
            mes={mes}
            onAnio={(v) => setPeriodo(v, mes)}
            onMes={(v) => setPeriodo(anio, v)}
          />
        </TabsContent>

        <TabsContent value="diario">
          <ResumenDiarioTab
            desde={desde}
            hasta={hasta}
            onDesde={(v) => setParam('desde', v)}
            onHasta={(v) => setParam('hasta', v)}
          />
        </TabsContent>

        <TabsContent value="metricas">
          <MetricasReservasTab
            anio={anio}
            mes={mes}
            onAnio={(v) => setPeriodo(v, mes)}
            onMes={(v) => setPeriodo(anio, v)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
