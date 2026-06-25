import React from 'react'
import Link from 'next/link'
import { PartyPopper, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ResumenEvento } from '../../types'
import { cn } from '@/lib/utils'

interface DrawerEventsListProps {
  eventos: ResumenEvento[]
}

function estadoCls(estado: string): string {
  if (estado === 'CONFIRMADA') return 'bg-blue-100 text-blue-700'
  if (estado === 'COMPLETADA') return 'bg-green-100 text-green-700'
  if (estado === 'CANCELADA') return 'bg-gray-100 text-gray-500'
  return 'bg-amber-100 text-amber-700'
}

function estadoLabel(estado: string): string {
  const m: Record<string, string> = { SOLICITADA: 'Solicitada', CONFIRMADA: 'Confirmada', COMPLETADA: 'Completada', CANCELADA: 'Cancelada' }
  return m[estado] ?? estado
}

export const DrawerEventsList = React.memo(({ eventos }: DrawerEventsListProps) => {
  if (eventos.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Eventos privados</p>
      <div className="bg-white rounded-xl border border-brand-rosa/20 divide-y divide-gray-50 overflow-hidden shadow-sm">
        {eventos.map((e) => (
          <Link
            key={e.id}
            href={`/admin/eventos/${e.id}`}
            className="flex items-center gap-3 px-3.5 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center shrink-0">
              <PartyPopper className="h-3.5 w-3.5 text-brand-rosa" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{e.tipoEvento}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {e.nombreCliente} · {e.horaInicio}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', estadoCls(e.estado))}>
                {estadoLabel(e.estado)}
              </span>
              <Badge variant="secondary" className="text-[10px]">{e.turno}</Badge>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
})

DrawerEventsList.displayName = 'DrawerEventsList'
