import { PartyPopper, ChevronRight, Calendar, Clock, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { EventoPrivado } from '@/features/cliente/shared/types'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export function EventoCard({ evento }: { evento: EventoPrivado }) {
  const hoy = startOfDay(new Date())
  const diasRestantes = differenceInDays(
    startOfDay(parseISO(evento.fechaEvento)),
    hoy
  )
  const cercano =
    evento.estado === 'CONFIRMADA' && diasRestantes >= 0 && diasRestantes <= 7

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-brand-rosa/30 transition-colors overflow-hidden">
      <div className="h-1 bg-brand-rosa" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0">
              <PartyPopper className="h-5 w-5 text-brand-rosa" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{evento.tipoEvento}</p>
              <EstadoBadge estado={evento.estado} compact />
            </div>
          </div>
          <Link
            href={`/cliente/mis-eventos/${evento.id}`}
            className="shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-brand-azul"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {cercano && (
          <div className="flex items-center gap-2 bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-brand-rosa shrink-0" />
            <p className="text-xs font-semibold text-brand-rosa">
              {diasRestantes === 0 ? 'Tu evento es hoy' : `Faltan ${diasRestantes} días`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(evento.fechaEvento)}
          </span>
          {evento.horaInicio && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {evento.horaInicio} – {evento.horaFin}
            </span>
          )}
          {evento.aforoDeclarado && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {evento.aforoDeclarado} invitados
            </span>
          )}
        </div>

        {evento.precioTotalContrato && (
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-gray-900">
              {formatCurrency(evento.precioTotalContrato)}
            </span>
            {evento.montoSaldo && evento.montoSaldo > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 text-xs"
              >
                Saldo: {formatCurrency(evento.montoSaldo)}
              </Badge>
            )}
          </div>
        )}

        <Link
          href={`/cliente/mis-eventos/${evento.id}`}
          className="flex items-center justify-center w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-rosa/40 hover:text-brand-rosa transition-all"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  )
}
