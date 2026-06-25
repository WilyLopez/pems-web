import React from 'react'
import Link from 'next/link'
import {
  Ticket, PartyPopper, Lock, History, Loader2,
  CalendarX, AlertCircle, Users, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Disponibilidad } from '../../types'
import { cn } from '@/lib/utils'
import { useDesactivarBloqueo } from '../../hooks/useCalendarData'

interface DrawerActionsProps {
  fecha: string
  disp?: Disponibilidad
  onBloquear: () => void
  bloqueandoPending: boolean
  esPasado: boolean
  tieneProgramacion: boolean
  tieneActividad: boolean
  totalReservas: number
  totalEventos: number
}

function BannerEvento({
  titulo,
  idEvento,
  turno,
}: {
  titulo?: string | null
  idEvento?: number | null
  turno: string
}) {
  return (
    <div className="bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl p-3.5">
      <div className="flex items-center gap-2">
        <PartyPopper className="h-4 w-4 text-brand-rosa shrink-0" />
        <p className="text-xs font-bold text-gray-900">Turno {turno} — evento privado</p>
      </div>
      {titulo && <p className="text-xs text-gray-500 mt-1.5 ml-6">{titulo}</p>}
      {idEvento && (
        <Link
          href={`/admin/eventos/${idEvento}`}
          className="ml-6 mt-1.5 inline-flex items-center gap-0.5 text-[11px] text-brand-azul hover:underline font-semibold"
        >
          Ver evento <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

function InfoBanner({ icon: Icon, message, variant = 'gray' }: {
  icon: React.ElementType
  message: string
  variant?: 'gray' | 'amber' | 'blue' | 'orange'
}) {
  const cls = {
    gray:   'bg-gray-50 border-gray-200 text-gray-600',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }[variant]

  return (
    <div className={cn('flex items-start gap-2.5 border rounded-xl px-3.5 py-3', cls)}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed">{message}</p>
    </div>
  )
}

export const DrawerActions = React.memo(({
  fecha,
  disp,
  onBloquear,
  bloqueandoPending,
  esPasado,
  tieneProgramacion,
  tieneActividad,
  totalReservas,
  totalEventos,
}: DrawerActionsProps) => {
  const desactivarBloqueo = useDesactivarBloqueo()

  if (esPasado) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3">
          <History className="h-4 w-4 text-gray-400 shrink-0" />
          <p className="text-xs font-semibold text-gray-500">
            Fecha histórica. Solo consulta disponible.
          </p>
        </div>
        {totalReservas > 0 && (
          <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 text-xs border-brand-azul/30 text-brand-azul hover:bg-brand-azul/5" asChild>
            <Link href={`/admin/reservas?fecha=${fecha}`}>
              <Ticket className="h-3.5 w-3.5" />
              Ver reservas del día
            </Link>
          </Button>
        )}
        {totalEventos > 0 && (
          <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 text-xs border-brand-rosa/30 text-brand-rosa hover:bg-brand-rosa/5" asChild>
            <Link href={`/admin/eventos?fecha=${fecha}`}>
              <PartyPopper className="h-3.5 w-3.5" />
              Ver eventos del día
            </Link>
          </Button>
        )}
      </div>
    )
  }

  const tipo = disp?.tipoOcupacion ?? 'LIBRE'
  const tipoDia = disp?.tipoDia

  if (tipoDia === 'NO_LABORABLE') {
    return (
      <InfoBanner
        icon={CalendarX}
        message="Día no laborable según la configuración del calendario. No se pueden crear reservas ni eventos."
        variant="orange"
      />
    )
  }

  if (tipoDia === 'FERIADO') {
    return (
      <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-700">
            {disp?.descripcionFeriado ?? 'Feriado — día cerrado'}
          </p>
        </div>
      </div>
    )
  }

  if (tipoDia === 'BLOQUEADO') {
    return (
      <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-400 shrink-0" />
          <p className="text-xs font-bold text-gray-700">Fecha bloqueada</p>
        </div>
        {disp?.bloqueadoManualmente && disp?.idBloqueo && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] font-black text-red-600 hover:text-red-700 hover:bg-red-50 px-2 rounded-lg shrink-0"
            onClick={() => desactivarBloqueo.mutate(disp.idBloqueo!)}
            disabled={desactivarBloqueo.isPending}
          >
            {desactivarBloqueo.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Desbloquear'}
          </Button>
        )}
      </div>
    )
  }

  if (tipo === 'PRIVADO_LLENO') {
    return (
      <div className="space-y-2">
        <BannerEvento titulo={disp?.tituloEventoT1} idEvento={disp?.idEventoT1} turno="T1" />
        <BannerEvento titulo={disp?.tituloEventoT2} idEvento={disp?.idEventoT2} turno="T2" />
      </div>
    )
  }

  if (tipo === 'PRIVADO_PARCIAL') {
    const turnoLibre = !disp?.turnoT1Ocupado ? 'T1' : 'T2'
    return (
      <div className="space-y-2">
        {disp?.turnoT1Ocupado && <BannerEvento titulo={disp.tituloEventoT1} idEvento={disp.idEventoT1} turno="T1" />}
        {disp?.turnoT2Ocupado && <BannerEvento titulo={disp.tituloEventoT2} idEvento={disp.idEventoT2} turno="T2" />}
        {disp?.disponiblePrivado && (
          <Button size="sm" className="w-full border-2 border-brand-rosa text-brand-rosa bg-transparent hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs font-bold" asChild>
            <Link href={`/admin/eventos/nuevo?fecha=${fecha}&turno=${turnoLibre}`}>
              <PartyPopper className="h-3.5 w-3.5" />
              Nuevo evento — turno {turnoLibre}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  if (tipo === 'PUBLICO') {
    const aforoCompleto = disp?.aforoCompleto ?? false
    const plazas = disp?.plazasDisponibles ?? 0
    return (
      <div className="space-y-2">
        {aforoCompleto ? (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-orange-800">Aforo completo</p>
                <p className="text-[11px] text-orange-600">No quedan plazas disponibles</p>
              </div>
            </div>
            <Link href={`/admin/reservas?fecha=${fecha}`} className="text-[11px] font-semibold text-brand-azul hover:underline shrink-0">
              Ver lista
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
              <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700 font-medium">{plazas} {plazas === 1 ? 'plaza disponible' : 'plazas disponibles'}</p>
            </div>
            <Button size="sm" className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs" asChild>
              <Link href="/admin/ventas/nueva">
                <Ticket className="h-3.5 w-3.5" />
                Nueva reserva
              </Link>
            </Button>
          </>
        )}
      </div>
    )
  }

  const disponiblePublico = disp?.disponiblePublico ?? false
  const disponiblePrivado = disp?.disponiblePrivado ?? false

  return (
    <div className="space-y-2">
      {!tieneProgramacion && (
        <InfoBanner
          icon={AlertCircle}
          message="La semana no está programada. Las reservas públicas no están habilitadas para esta semana."
          variant="amber"
        />
      )}

      {tieneProgramacion && !disponiblePublico && (
        <InfoBanner
          icon={AlertCircle}
          message="Esta fecha está fuera de la ventana de anticipación configurada. Los clientes no pueden reservar este día."
          variant="blue"
        />
      )}

      {disponiblePublico && (
        <Button size="sm" className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs" asChild>
          <Link href="/admin/ventas/nueva">
            <Ticket className="h-3.5 w-3.5" />
            Nueva reserva
          </Link>
        </Button>
      )}

      {disponiblePrivado && (
        <Button size="sm" variant="outline" className="w-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs" asChild>
          <Link href={`/admin/eventos/nuevo?fecha=${fecha}`}>
            <PartyPopper className="h-3.5 w-3.5" />
            Nuevo evento privado
          </Link>
        </Button>
      )}

      {tieneActividad ? (
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3">
          <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500 font-medium">
            Día con actividad. No se puede bloquear.
          </p>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'w-full rounded-xl gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50',
          )}
          onClick={onBloquear}
          disabled={bloqueandoPending}
        >
          <Lock className="h-3.5 w-3.5" />
          Bloquear este día
        </Button>
      )}
    </div>
  )
})

DrawerActions.displayName = 'DrawerActions'
