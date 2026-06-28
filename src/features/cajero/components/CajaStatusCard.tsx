'use client'

import { TrendingUp, TrendingDown, Clock, CheckCircle2, Lock } from 'lucide-react'
import { AperturaCaja } from '@/features/admin/finanzas'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  caja: AperturaCaja
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function CajaStatusCard({ caja }: Props) {
  const estaAbierta = caja.estado === 'ABIERTA'
  const saldoEsperado = caja.saldoEsperado
    ?? (caja.saldoInicial + caja.totalIngresos - caja.totalEgresos)

  const metricas = [
    {
      label: 'Saldo inicial',
      value: caja.saldoInicial,
      icon: TrendingUp,
      color: 'bg-gray-100 text-gray-600',
    },
    {
      label: 'Total ingresos',
      value: caja.totalIngresos,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total egresos',
      value: caja.totalEgresos,
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600',
    },
    {
      label: estaAbierta ? 'Saldo esperado' : 'Saldo contado',
      value: estaAbierta ? saldoEsperado : (caja.saldoFinal ?? saldoEsperado),
      icon: TrendingUp,
      color: 'bg-brand-azul/10 text-brand-azul',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 capitalize">{formatFecha(caja.fecha)}</p>
          {estaAbierta ? (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Abierta desde las {formatHora(caja.fechaApertura)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Cerrada a las {caja.fechaCierre ? formatHora(caja.fechaCierre) : '—'}
            </p>
          )}
        </div>
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full',
          estaAbierta
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-600',
        )}>
          {estaAbierta
            ? <><CheckCircle2 className="h-3.5 w-3.5" /> ABIERTA</>
            : <><Lock className="h-3.5 w-3.5" /> CERRADA</>
          }
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricas.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{formatCurrency(value)}</p>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {!estaAbierta && caja.diferencia != null && (
        <div className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold',
          caja.diferencia >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
        )}>
          <span>Diferencia al cierre</span>
          <span>
            {caja.diferencia >= 0 ? '+' : ''}{formatCurrency(caja.diferencia)}
          </span>
        </div>
      )}

      {caja.observaciones && (
        <p className="text-xs text-gray-400 px-1">{caja.observaciones}</p>
      )}
    </div>
  )
}
