'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import {
  CalendarDays,
  PartyPopper,
  User,
  Ticket,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

import { reservaService } from '@/services/reserva.service'
import { eventoService } from '@/services/evento.service'
import { Reserva } from '@/types/reserva.types'
import { EventoPrivado } from '@/types/evento.types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from '@/components/common/Statusbadge'
import { formatDate, formatCurrency } from '@/lib/utils'

function saludo(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function EventoCountdownBanner({ evento }: { evento: EventoPrivado }) {
  const dias = differenceInDays(
    startOfDay(parseISO(evento.fechaEvento)),
    startOfDay(new Date())
  )

  return (
    <div className="rounded-2xl bg-gradient-to-r from-brand-rosa/10 to-brand-azul/10 border border-brand-rosa/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-rosa/15 flex items-center justify-center shrink-0">
        <PartyPopper className="h-5 w-5 text-brand-rosa" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">
          Tu evento privado es en {dias === 0 ? '¡hoy!' : `${dias} día${dias !== 1 ? 's' : ''}!`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {evento.tipoEvento} · {formatDate(evento.fechaEvento)}
          {evento.montoSaldo && evento.montoSaldo > 0 ? (
            <span className="ml-2 text-amber-700 font-semibold">
              · Saldo pendiente: {formatCurrency(evento.montoSaldo)}
            </span>
          ) : null}
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full shrink-0"
      >
        <Link href={`/cliente/mis-eventos/${evento.id}`}>Ver detalles</Link>
      </Button>
    </div>
  )
}

const QUICK_LINKS = [
  {
    href: '/reservar',
    icon: Ticket,
    label: 'Reservar visita',
    desc: 'Elige fecha y horario',
    color: 'bg-brand-azul/10',
    iconColor: 'text-brand-azul',
  },
  {
    href: '/cliente/mis-reservas',
    icon: CalendarDays,
    label: 'Mis reservas',
    desc: 'Ver historial y tickets',
    color: 'bg-brand-rosa/10',
    iconColor: 'text-brand-rosa',
  },
  {
    href: '/cliente/mis-eventos',
    icon: PartyPopper,
    label: 'Mis eventos',
    desc: 'Eventos privados',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    href: '/cliente/mi-cuenta',
    icon: User,
    label: 'Mi cuenta',
    desc: 'Perfil y datos',
    color: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
]

function ReservaRow({ reserva }: { reserva: Reserva }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
        <CalendarDays className="h-4 w-4 text-brand-azul" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {reserva.nombreNino}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(reserva.fechaEvento)}
        </p>
      </div>
      <StatusBadge status={reserva.estado} />
    </div>
  )
}

export default function ClienteDashboard() {
  const { data: session } = useSession()
  const userName = session?.user?.name?.split(' ')[0] ?? 'Cliente'

  const { data: reservasData, isLoading: loadingReservas } = useQuery({
    queryKey: ['cliente-reservas-dashboard'],
    queryFn: () => reservaService.listar({ page: 0, size: 10 }),
    enabled: !!session,
  })

  const { data: eventosData, isLoading: loadingEventos } = useQuery({
    queryKey: ['cliente-eventos-dashboard'],
    queryFn: () => eventoService.listar({ page: 0, size: 10 }),
    enabled: !!session,
  })

  const eventoProximo = useMemo<EventoPrivado | null>(() => {
    const hoy = startOfDay(new Date())
    return (
      eventosData?.content
        ?.filter((e: EventoPrivado) => {
          if (e.estado !== 'CONFIRMADA') return false
          const diff = differenceInDays(startOfDay(parseISO(e.fechaEvento)), hoy)
          return diff >= 0 && diff <= 7
        })
        ?.sort(
          (a: EventoPrivado, b: EventoPrivado) =>
            parseISO(a.fechaEvento).getTime() - parseISO(b.fechaEvento).getTime()
        )[0] ?? null
    )
  }, [eventosData])

  const proximas = useMemo<Reserva[]>(() => {
    return (
      reservasData?.content
        ?.filter((r: Reserva) =>
          ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
        )
        ?.slice(0, 3) ?? []
    )
  }, [reservasData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          {saludo()}, {userName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Bienvenido a tu área personal de Kiki y Lala
        </p>
      </div>

      {eventoProximo && <EventoCountdownBanner evento={eventoProximo} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3 hover:shadow-md hover:border-brand-azul/20 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 group-hover:text-brand-azul transition-colors">
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-azul" />
              Próximas reservas
            </h2>
            <Link
              href="/cliente/mis-reservas"
              className="text-xs text-brand-azul font-semibold hover:underline flex items-center gap-0.5"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingReservas && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          )}

          {!loadingReservas && proximas.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tienes reservas próximas</p>
              <Button
                asChild
                size="sm"
                className="mt-3 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-1.5"
              >
                <Link href="/reservar">
                  <Ticket className="h-3.5 w-3.5" />
                  Reservar ahora
                </Link>
              </Button>
            </div>
          )}

          {proximas.map((r) => (
            <ReservaRow key={r.id} reserva={r} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
