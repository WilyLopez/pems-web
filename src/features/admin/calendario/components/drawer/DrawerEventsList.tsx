import React from 'react'
import { PartyPopper } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ResumenEvento } from '../../types'

interface DrawerEventsListProps {
  eventos: ResumenEvento[]
}

export const DrawerEventsList = React.memo(({ eventos }: DrawerEventsListProps) => {
  if (eventos.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Eventos privados</p>
      <div className="bg-white rounded-xl border border-brand-rosa/20 divide-y divide-gray-50 overflow-hidden">
        {eventos.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center shrink-0">
              <PartyPopper className="h-3.5 w-3.5 text-brand-rosa" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{e.tipoEvento}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {e.nombreCliente} — {e.horaInicio}
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{e.turno}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
})

DrawerEventsList.displayName = 'DrawerEventsList'
