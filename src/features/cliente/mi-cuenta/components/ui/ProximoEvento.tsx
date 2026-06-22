import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarDays, ArrowRight, ChevronRight, PartyPopper, Ticket } from 'lucide-react'
import { startOfDay, parseISO, isFuture, differenceInDays } from 'date-fns'
import { Reserva, EventoPrivado } from '../../../shared/types'
import { formatDate } from '@/lib/utils'

interface ProximoEventoProps {
  reservas: Reserva[]
  eventos: EventoPrivado[]
}

export function ProximoEvento({ reservas, eventos }: ProximoEventoProps) {
  const hoy = startOfDay(new Date())

  const proximaReserva = useMemo(
    () =>
      reservas
        .filter(
          (r) =>
            ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) &&
            isFuture(startOfDay(parseISO(r.fechaEvento)))
        )
        .sort((a, b) => parseISO(a.fechaEvento).getTime() - parseISO(b.fechaEvento).getTime())[0] ?? null,
    [reservas]
  )

  const proximoEvento = useMemo(
    () =>
      eventos
        .filter(
          (e) =>
            e.estado === 'CONFIRMADA' &&
            isFuture(startOfDay(parseISO(e.fechaEvento)))
        )
        .sort((a, b) => parseISO(a.fechaEvento).getTime() - parseISO(b.fechaEvento).getTime())[0] ?? null,
    [eventos]
  )

  if (!proximaReserva && !proximoEvento) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <CalendarDays className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Sin próximas visitas</p>
          <p className="text-xs text-gray-500 mt-0.5">Actualmente no tienes eventos programados.</p>
        </div>
        <Link
          href="/reservar"
          className="ml-auto shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul hover:underline"
        >
          Reservar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  if (proximoEvento) {
    const dias = differenceInDays(startOfDay(parseISO(proximoEvento.fechaEvento)), hoy)
    return (
      <div className="bg-gradient-to-r from-brand-rosa/5 to-brand-azul/5 rounded-2xl border border-brand-rosa/20 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-rosa/15 flex items-center justify-center shrink-0">
              <PartyPopper className="h-5 w-5 text-brand-rosa" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-rosa mb-0.5">
                Próximo evento privado
              </p>
              <p className="text-base font-black text-gray-900">{proximoEvento.tipoEvento}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(proximoEvento.fechaEvento, "EEEE d 'de' MMMM")}
                {dias === 0 ? ' · ¡Hoy!' : dias === 1 ? ' · Mañana' : ` · en ${dias} días`}
              </p>
            </div>
          </div>
          <Link
            href={`/cliente/mis-eventos/${proximoEvento.id}`}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul bg-white border border-brand-azul/20 px-3 py-1.5 rounded-xl hover:bg-brand-azul/5 transition-colors"
          >
            Ver <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  const dias = differenceInDays(startOfDay(parseISO(proximaReserva!.fechaEvento)), hoy)
  return (
    <div className="bg-gradient-to-r from-brand-azul/5 to-brand-azul/10 rounded-2xl border border-brand-azul/20 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-azul/15 flex items-center justify-center shrink-0">
            <Ticket className="h-5 w-5 text-brand-azul" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-azul mb-0.5">
              Próxima visita
            </p>
            <p className="text-base font-black text-gray-900">
              {formatDate(proximaReserva!.fechaEvento, "EEEE d 'de' MMMM")}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              Visita de {proximaReserva!.nombreNino}
              {dias === 0 ? ' · ¡Hoy!' : dias === 1 ? ' · Mañana' : ` · en ${dias} días`}
            </p>
          </div>
        </div>
        <Link
          href="/cliente/mis-reservas"
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul bg-white border border-brand-azul/20 px-3 py-1.5 rounded-xl hover:bg-brand-azul/5 transition-colors"
        >
          Ver <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
