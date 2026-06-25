import React from 'react'
import Link from 'next/link'
import { Sun, Sunset, Users, ChevronRight, PartyPopper, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ResumenTurno } from '../../types'
import { cn } from '@/lib/utils'

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

interface DrawerTurnoCardProps {
  turno: ResumenTurno
  label: string
  horario: string
  turnoKey: string
  fecha: string
  esPasado: boolean
  disponiblePrivado: boolean
}

export const DrawerTurnoCard = React.memo(({
  turno,
  label,
  horario,
  turnoKey,
  fecha,
  esPasado,
  disponiblePrivado,
}: DrawerTurnoCardProps) => {
  const Icon = turnoKey === 'T1' ? Sun : Sunset
  const tieneReservas = turno.totalReservas > 0
  const permitirAsignar = !esPasado && disponiblePrivado && !tieneReservas && !turno.eventoPrivado

  const borderCls = turno.eventoPrivado
    ? 'border-brand-rosa/30 bg-brand-rosa/5'
    : tieneReservas
    ? 'border-brand-azul/20 bg-brand-azul/5'
    : !turno.disponible
    ? 'border-orange-200 bg-orange-50'
    : 'border-gray-100 bg-white'

  const badgeLabel = turno.eventoPrivado
    ? 'Evento privado'
    : tieneReservas
    ? 'Reservas públicas'
    : turno.disponible
    ? 'Disponible'
    : 'Ocupado'

  const badgeCls = turno.eventoPrivado
    ? 'bg-brand-rosa/15 text-brand-rosa'
    : tieneReservas
    ? 'bg-brand-azul/10 text-brand-azul'
    : turno.disponible
    ? 'bg-green-100 text-green-800'
    : 'bg-orange-100 text-orange-800'

  return (
    <div className={cn('rounded-xl border p-3.5 space-y-2', borderCls)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <span className="text-xs font-bold text-gray-900">{label}</span>
          {horario && (
            <span className="text-[10px] text-gray-400 font-mono">{horario}</span>
          )}
        </div>
        <Badge variant="secondary" className={cn('text-[10px] font-bold', badgeCls)}>
          {badgeLabel}
        </Badge>
      </div>

      {turno.eventoPrivado && (
        <div className="text-[11px] text-gray-600 space-y-1 pl-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-gray-800 text-xs">{turno.eventoPrivado.tipoEvento}</p>
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', estadoCls(turno.eventoPrivado.estado))}>
              {estadoLabel(turno.eventoPrivado.estado)}
            </span>
          </div>
          <p className="truncate text-gray-500">{turno.eventoPrivado.nombreCliente}</p>
          {turno.eventoPrivado.aforoDeclarado && (
            <p className="flex items-center gap-1 text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {turno.eventoPrivado.aforoDeclarado} invitados
            </p>
          )}
          <Link
            href={`/admin/eventos/${turno.eventoPrivado.id}`}
            className="inline-flex items-center gap-0.5 text-brand-azul hover:underline font-semibold mt-0.5"
          >
            Ver evento <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {!turno.eventoPrivado && tieneReservas && (
        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 pl-1">
          <Ticket className="h-3.5 w-3.5 text-brand-azul" />
          {turno.totalReservas} {turno.totalReservas === 1 ? 'reserva' : 'reservas'}
        </p>
      )}

      {permitirAsignar && (
        <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5 rounded-lg gap-1 w-full" asChild>
          <Link href={`/admin/eventos/nuevo?fecha=${fecha}&turno=${turnoKey}`}>
            <PartyPopper className="h-3 w-3" />
            Asignar evento
          </Link>
        </Button>
      )}
    </div>
  )
})

DrawerTurnoCard.displayName = 'DrawerTurnoCard'
