'use client'

import { useState } from 'react'
import { BarChart3, TrendingDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/common/PageHeader'
import {
  PeriodoSelector,
  useDashboardFinanciero,
} from '@/features/admin/finanzas'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { FinanzasKpiGrid } from '../components/FinanzasKpiGrid'
import { DesglosePorcentual } from '../components/DesglosePorcentual'
import { ComposicionDonut } from '../components/ComposicionDonut'
import { IngresosVsEgresosChart } from '../components/IngresosVsEgresosChart'
import { ReservasPeriodo } from '../components/ReservasPeriodo'
import { FinancieroSkeleton } from '../components/FinancieroSkeleton'
import { EGRESO_DESGLOSE, INGRESO_DESGLOSE } from '../config'
import { construirDesglose } from '../utils/finance-calc'

export function DashboardFinancieroView() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)

  const {
    data: dash,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardFinanciero(idSede ?? undefined, anio, mes)

  const mensajeError =
    error instanceof Error ? error.message : 'Error desconocido'

  const ingresos = dash ? construirDesglose(dash, INGRESO_DESGLOSE) : []
  const egresos = dash ? construirDesglose(dash, EGRESO_DESGLOSE) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Dashboard Financiero"
          description="Resumen consolidado de ingresos, egresos y caja"
        />
        <PeriodoSelector
          anio={anio}
          mes={mes}
          onAnio={setAnio}
          onMes={setMes}
        />
      </div>

      {isLoading ? (
        <FinancieroSkeleton />
      ) : isError ? (
        <DashboardCard className="flex flex-col items-center justify-center border-dashed py-12">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            No se pudo cargar el dashboard financiero
          </p>
          <p className="max-w-md px-4 text-center text-xs text-red-400">
            {mensajeError}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-xs font-bold text-brand-azul hover:underline"
          >
            Reintentar
          </button>
        </DashboardCard>
      ) : !dash ? (
        <DashboardCard className="border-dashed py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Sin datos para el periodo seleccionado.
          </p>
        </DashboardCard>
      ) : (
        <>
          <FinanzasKpiGrid data={dash} />

          <IngresosVsEgresosChart data={dash.serieDiaria ?? []} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DesglosePorcentual
              titulo="Desglose de ingresos"
              icon={BarChart3}
              items={ingresos}
              total={dash.totalIngresos}
            />
            <DesglosePorcentual
              titulo="Desglose de egresos"
              icon={TrendingDown}
              items={egresos}
              total={dash.totalEgresos}
            />
            <ReservasPeriodo data={dash} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ComposicionDonut
              titulo="Composición de ingresos"
              items={ingresos}
              total={dash.totalIngresos}
            />
            <ComposicionDonut
              titulo="Composición de egresos"
              items={egresos}
              total={dash.totalEgresos}
            />
          </div>
        </>
      )}
    </div>
  )
}
