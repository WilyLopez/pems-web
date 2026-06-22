import React from 'react'
import Link from 'next/link'
import { Ticket, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ResumenReserva } from '../../types'

interface DrawerReservationsListProps {
  reservas: ResumenReserva[]
  fecha: string
}

export const DrawerReservationsList = React.memo(({ reservas, fecha }: DrawerReservationsListProps) => {
  if (reservas.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Reservas publicas</p>
        <div className="flex items-center gap-2">
          {reservas.length > 5 && (
            <Badge variant="outline" className="text-[10px] font-bold text-brand-azul border-brand-azul/20">
              + {reservas.length - 5} entradas
            </Badge>
          )}
          <Link
            href={`/admin/reservas?fecha=${fecha}`}
            className="text-[11px] text-brand-azul font-semibold flex items-center gap-0.5 hover:underline"
          >
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {reservas.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
              <Ticket className="h-3.5 w-3.5 text-brand-azul" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{r.nombreNino}</p>
              <p className="text-[11px] text-gray-400 font-mono truncate">{r.numeroTicket}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{r.estado}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
})

DrawerReservationsList.displayName = 'DrawerReservationsList'
