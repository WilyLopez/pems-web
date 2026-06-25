import React from 'react'
import { Ticket, PartyPopper, TrendingUp } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

interface DrawerStatsProps {
  reservas: number
  eventos: number
  ingresos: number
}

export const DrawerStats = React.memo(({ reservas, eventos, ingresos }: DrawerStatsProps) => {
  const stats = [
    { icon: Ticket,     label: 'Reservas', value: reservas,                   color: 'bg-brand-azul/10 text-brand-azul' },
    { icon: PartyPopper, label: 'Eventos',  value: eventos,                    color: 'bg-brand-rosa/10 text-brand-rosa' },
    { icon: TrendingUp, label: 'Ingresos', value: formatCurrency(ingresos, 0), color: 'bg-green-100 text-green-700' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <div className={cn('w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center', color)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-black text-gray-900">{value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
})

DrawerStats.displayName = 'DrawerStats'
