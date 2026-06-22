import React from 'react'
import Link from 'next/link'
import { Sun, Sunset, Users, ChevronRight, Ticket, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ResumenTurno } from '../../types'
import { cn } from '@/lib/utils'

interface DrawerTurnoCardProps {
  turno: ResumenTurno
  label: string
  horario: string
  turnoKey: string
  fecha: string
  esPasado: boolean
  esSemanaBloqueada: boolean
}

export const DrawerTurnoCard = React.memo(({
  turno,
  label,
  horario,
  turnoKey,
  fecha,
  esPasado,
  esSemanaBloqueada,
}: DrawerTurnoCardProps) => {
  const Icon = turnoKey === 'T1' ? Sun : Sunset
  const tieneReservas = turno.totalReservas > 0
  const permitirAsignar = !esPasado && !esSemanaBloqueada && !tieneReservas

  return (
    <div
      className={cn(
        'rounded-xl border p-3 space-y-1.5',
        turno.eventoPrivado
          ? 'border-brand-rosa/30 bg-brand-rosa/5'
          : tieneReservas
          ? 'border-brand-azul/20 bg-brand-azul/5'
          : !turno.disponible
          ? 'border-orange-200 bg-orange-50'
          : 'border-gray-100 bg-white'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-900">{label}</span>
          <span className="text-[10px] text-gray-400">{horario}</span>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'text-[10px]',
            turno.eventoPrivado
              ? 'bg-brand-rosa/15 text-brand-rosa'
              : tieneReservas
              ? 'bg-brand-azul/10 text-brand-azul'
              : turno.disponible
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          )}
        >
          {turno.eventoPrivado
            ? 'Evento privado'
            : tieneReservas
            ? 'Reservas publicas'
            : turno.disponible
            ? 'Disponible'
            : 'Ocupado'}
        </Badge>
      </div>

      {turno.disponible && !turno.eventoPrivado && permitirAsignar && (
        <Button size="sm" variant="outline" className="h-6 text-[11px] px-2 rounded-lg gap-1 w-full" asChild>
          <Link href={`/admin/eventos/nuevo?fecha=${fecha}&turno=${turnoKey}`}>
            <PartyPopper className="h-3 w-3" />
            Asignar evento
          </Link>
        </Button>
      )}

      {turno.eventoPrivado && (
        <div className="text-[11px] text-gray-600 space-y-0.5">
          <p className="font-semibold text-gray-800 truncate">{turno.eventoPrivado.tipoEvento}</p>
          <p className="truncate">{turno.eventoPrivado.nombreCliente}</p>
          {turno.eventoPrivado.aforoDeclarado && (
            <p className="flex items-center gap-1">
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

      {!turno.eventoPrivado && turno.totalReservas > 0 && (
        <p className="text-[11px] text-gray-500 flex items-center gap-1">
          <Ticket className="h-3.5 w-3.5" />
          {turno.totalReservas} reservas
        </p>
      )}
    </div>
  )
})

DrawerTurnoCard.displayName = 'DrawerTurnoCard'
