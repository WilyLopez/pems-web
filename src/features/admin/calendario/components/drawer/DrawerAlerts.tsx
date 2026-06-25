import React from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { AlertaDia } from '../../types'
import { cn } from '@/lib/utils'

interface DrawerAlertsProps {
  alertas: AlertaDia[]
}

export const DrawerAlerts = React.memo(({ alertas }: DrawerAlertsProps) => {
  if (alertas.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Alertas</p>
      {alertas.map((alerta, i) => {
        const config = {
          DANGER:  { cls: 'bg-red-50 border-red-200 text-red-700',     icon: AlertTriangle },
          WARNING: { cls: 'bg-amber-50 border-amber-200 text-amber-700', icon: AlertTriangle },
          INFO:    { cls: 'bg-blue-50 border-blue-200 text-blue-700',   icon: Info },
        }[alerta.nivel]
        const Icon = config.icon

        return (
          <div key={i} className={cn('flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed', config.cls)}>
            <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {alerta.mensaje}
          </div>
        )
      })}
    </div>
  )
})

DrawerAlerts.displayName = 'DrawerAlerts'
