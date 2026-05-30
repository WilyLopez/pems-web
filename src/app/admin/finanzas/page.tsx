'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Ticket,
  AlertCircle,
  Landmark,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardFinanciero } from '@/hooks/useFinanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  valueClass,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  valueClass?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={cn('text-2xl font-black', valueClass ?? 'text-gray-900')}>{value}</p>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse" />
}

export default function FinanzasDashboardPage() {
  const { idSede } = useAuth()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes]   = useState(hoy.getMonth() + 1)

  const { data: dash, isLoading } = useDashboardFinanciero(idSede ?? undefined, anio, mes)

  const anios = Array.from({ length: 5 }, (_, i) => hoy.getFullYear() - i)

  const utilidadPositiva = (dash?.utilidadNeta ?? 0) >= 0
  const margen = dash && dash.totalIngresos > 0
    ? ((dash.utilidadNeta / dash.totalIngresos) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader title="Dashboard Financiero" description="Resumen consolidado de ingresos, egresos y caja" />
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
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : !dash ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Sin datos para el periodo seleccionado.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total ingresos"
              value={formatCurrency(dash.totalIngresos)}
              sub={`Reservas: ${formatCurrency(dash.ingresoReservas)} · Adelantos: ${formatCurrency(dash.ingresoAdelantos)}`}
              icon={TrendingUp}
              color="bg-emerald-100 text-emerald-700"
            />
            <KpiCard
              label="Total egresos"
              value={formatCurrency(dash.totalEgresos)}
              sub={`Fijo: ${formatCurrency(dash.egresoFijo)} · Variable: ${formatCurrency(dash.egresoVariable)}`}
              icon={TrendingDown}
              color="bg-red-100 text-red-600"
            />
            <KpiCard
              label="Utilidad neta"
              value={formatCurrency(dash.utilidadNeta)}
              sub={`Margen: ${margen}%`}
              icon={DollarSign}
              color={utilidadPositiva ? 'bg-brand-azul/10 text-brand-azul' : 'bg-red-100 text-red-600'}
              valueClass={utilidadPositiva ? 'text-brand-azul' : 'text-red-600'}
            />
            <KpiCard
              label="Ticket promedio"
              value={formatCurrency(dash.ticketPromedio)}
              sub={`${dash.reservasConfirmadas} reservas confirmadas`}
              icon={Ticket}
              color="bg-brand-amarillo/20 text-yellow-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                Desglose de ingresos
              </h3>
              <ul className="space-y-2">
                {[
                  { label: 'Reservas públicas', value: dash.ingresoReservas,  color: 'bg-emerald-500' },
                  { label: 'Adelantos eventos',  value: dash.ingresoAdelantos, color: 'bg-brand-azul' },
                  { label: 'Ingresos manuales',  value: dash.ingresoManual,    color: 'bg-brand-amarillo' },
                ].map(({ label, value, color }) => {
                  const pct = dash.totalIngresos > 0
                    ? Math.round((value / dash.totalIngresos) * 100)
                    : 0
                  return (
                    <li key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-gray-400" />
                Desglose de egresos
              </h3>
              <ul className="space-y-2">
                {[
                  { label: 'Fijo',      value: dash.egresoFijo,      color: 'bg-red-500' },
                  { label: 'Variable',  value: dash.egresoVariable,  color: 'bg-orange-400' },
                  { label: 'Eventual',  value: dash.egresoEventual,  color: 'bg-yellow-400' },
                ].map(({ label, value, color }) => {
                  const pct = dash.totalEgresos > 0
                    ? Math.round((value / dash.totalEgresos) * 100)
                    : 0
                  return (
                    <li key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                Reservas del periodo
              </h3>
              <ul className="divide-y divide-gray-100">
                <li className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Confirmadas</span>
                  <span className="font-semibold text-emerald-600">{dash.reservasConfirmadas}</span>
                </li>
                <li className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Canceladas</span>
                  <span className="font-semibold text-red-500">{dash.reservasCanceladas}</span>
                </li>
                <li className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Saldo pendiente eventos</span>
                  <span className="font-semibold text-brand-azul">{formatCurrency(dash.saldoPendienteEventos)}</span>
                </li>
              </ul>

              {dash.saldoPendienteEventos > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Hay eventos privados con saldo pendiente de cobro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
