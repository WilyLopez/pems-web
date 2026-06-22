import React from 'react'
import Link from 'next/link'
import { Ticket, PartyPopper, Lock, History, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Disponibilidad } from '../../types'
import { cn } from '@/lib/utils'
import { useDesactivarBloqueo } from '../../hooks/useCalendarData'

interface DrawerActionsProps {
  fecha: string
  disp?: Disponibilidad
  onBloquear: () => void
  bloqueandoPending: boolean
  esPasado: boolean
  esSemanaBloqueada: boolean
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
  const Icon = turno === 'T1' ? PartyPopper : PartyPopper // Just using PartyPopper for both if Sun/Sunset not here
  return (
    <div className="bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-rosa shrink-0" />
        <p className="text-xs font-bold text-gray-900">Turno {turno} — evento privado</p>
      </div>
      {titulo && <p className="text-xs text-gray-500 mt-1 ml-6">{titulo}</p>}
      {idEvento && (
        <Link
          href={`/admin/eventos/${idEvento}`}
          className="ml-6 mt-1 inline-flex items-center gap-0.5 text-[11px] text-brand-azul hover:underline font-semibold"
        >
          Ver evento
        </Link>
      )}
    </div>
  )
}

export const DrawerActions = React.memo(({
  fecha,
  disp,
  onBloquear,
  bloqueandoPending,
  esPasado,
  esSemanaBloqueada,
}: DrawerActionsProps) => {
  const desactivarBloqueo = useDesactivarBloqueo()

  if (esPasado) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <History className="h-4 w-4 text-gray-400 shrink-0" />
          <p className="text-xs font-semibold text-gray-500">
            Fecha historica. Solo consulta disponible.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 text-xs border-brand-azul/30 text-brand-azul hover:bg-brand-azul/5"
          asChild
        >
          <Link href={`/admin/reservas?fecha=${fecha}`}>
            <Ticket className="h-3.5 w-3.5" />
            Ver reservas del dia
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 text-xs border-brand-rosa/30 text-brand-rosa hover:bg-brand-rosa/5"
          asChild
        >
          <Link href={`/admin/eventos?fecha=${fecha}`}>
            <PartyPopper className="h-3.5 w-3.5" />
            Ver eventos del dia
          </Link>
        </Button>
      </div>
    )
  }

  const tieneReservas = (disp?.totalReservas ?? 0) > 0
  const tieneAtencionActiva = (disp?.aforoPublicoActual ?? 0) > 0
  const tipo = disp?.tipoOcupacion ?? 'LIBRE'

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
        {disp?.turnoT1Ocupado && (
          <BannerEvento titulo={disp.tituloEventoT1} idEvento={disp.idEventoT1} turno="T1" />
        )}
        {disp?.turnoT2Ocupado && (
          <BannerEvento titulo={disp.tituloEventoT2} idEvento={disp.idEventoT2} turno="T2" />
        )}
        {!esSemanaBloqueada && !tieneReservas && (
          <Button
            size="sm"
            className="w-full border-2 border-brand-rosa text-brand-rosa bg-transparent hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs font-bold"
            asChild
          >
            <Link href={`/admin/eventos/nuevo?fecha=${fecha}&turno=${turnoLibre}`}>
              <PartyPopper className="h-3.5 w-3.5" />
              Nuevo evento en turno {turnoLibre}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  if (tipo === 'PUBLICO' || tieneReservas) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-400">
          Dia con reservas publicas. No admite eventos privados.
        </p>
        <Button
          size="sm"
          className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs"
          asChild
        >
          <Link href={`/admin/reservas?fecha=${fecha}`}>
            <Ticket className="h-3.5 w-3.5" />
            Nueva reserva
          </Link>
        </Button>
      </div>
    )
  }

  if (tipo === 'BLOQUEADO' || tipo === 'FERIADO' || disp?.tipoBloqueo === 'PLANIFICACION_SEMANAL') {
    const esPlanif = disp?.tipoBloqueo === 'PLANIFICACION_SEMANAL'
    return (
      <div className="space-y-2">
        <div className={cn(
          "border rounded-xl p-3 flex items-center justify-between gap-2",
          esPlanif ? "bg-brand-azul/5 border-brand-azul/20" : "bg-gray-50 border-gray-200"
        )}>
          <div className="flex items-center gap-2">
            <Lock className={cn("h-4 w-4 shrink-0", esPlanif ? "text-brand-azul" : "text-gray-400")} />
            <p className="text-xs font-bold text-gray-700">
              {tipo === 'FERIADO'
                ? disp?.descripcionFeriado ?? 'Feriado / dia cerrado'
                : esPlanif ? 'Programacion semanal activa' : 'Fecha bloqueada'}
            </p>
          </div>
          {disp?.bloqueadoManualmente && disp?.idBloqueo && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[10px] font-black text-red-600 hover:text-red-700 hover:bg-red-50 px-2 rounded-lg"
              onClick={() => desactivarBloqueo.mutate(disp.idBloqueo!)}
              disabled={desactivarBloqueo.isPending}
            >
              {desactivarBloqueo.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Desbloquear'}
            </Button>
          )}
        </div>
        {esPlanif && (
           <Button
             size="sm"
             className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs"
             asChild
           >
             <Link href={`/admin/reservas?fecha=${fecha}`}>
               <Ticket className="h-3.5 w-3.5" />
               Nueva reserva
             </Link>
           </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs"
        asChild
      >
        <Link href={`/admin/reservas?fecha=${fecha}`}>
          <Ticket className="h-3.5 w-3.5" />
          Nueva reserva
        </Link>
      </Button>
      {!esSemanaBloqueada && !tieneReservas && (
        <Button
          size="sm"
          variant="outline"
          className="w-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs"
          asChild
        >
          <Link href={`/admin/eventos/nuevo?fecha=${fecha}`}>
            <PartyPopper className="h-3.5 w-3.5" />
            Nuevo evento
          </Link>
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "w-full rounded-xl gap-1.5 text-xs",
          tieneAtencionActiva
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-red-200 text-red-600 hover:bg-red-50"
        )}
        onClick={onBloquear}
        disabled={bloqueandoPending || tieneAtencionActiva}
        title={tieneAtencionActiva ? 'No se puede bloquear un dia con atencion activa' : ''}
      >
        <Lock className="h-3.5 w-3.5" />
        Bloquear este dia
      </Button>
    </div>
  )
})

DrawerActions.displayName = 'DrawerActions'
