'use client'

import { Users, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardFinanciero } from '@/features/admin/finanzas'
import { DashboardCard } from '../../shared/components/DashboardCard'

interface Props {
  data: DashboardFinanciero
}

export function ReservasPeriodo({ data }: Props) {
  return (
    <DashboardCard className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        Reservas del periodo
      </h3>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        <li className="flex justify-between py-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Confirmadas</span>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {data.reservasConfirmadas}
          </span>
        </li>
        <li className="flex justify-between py-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Canceladas</span>
          <span className="font-semibold tabular-nums text-red-500 dark:text-red-400">
            {data.reservasCanceladas}
          </span>
        </li>
        <li className="flex justify-between py-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Saldo pendiente eventos
          </span>
          <span className="font-semibold tabular-nums text-brand-azul">
            {formatCurrency(data.saldoPendienteEventos)}
          </span>
        </li>
      </ul>

      {data.saldoPendienteEventos > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/30">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Hay eventos privados con saldo pendiente de cobro.
          </p>
        </div>
      )}
    </DashboardCard>
  )
}
