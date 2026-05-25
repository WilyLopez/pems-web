'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  X,
  Ticket,
  PartyPopper,
  TrendingUp,
  AlertTriangle,
  Sun,
  Sunset,
  Users,
  CreditCard,
  Info,
  ChevronRight,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

import { useResumenDia, useBloquearFechas } from '@/hooks/useCalendario'
import { AlertaDia, ResumenTurno } from '@/types/calendario.types'
import { GastosOperativosDia } from '@/components/admin/finanzas/GastosOperativosDia'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { formatCurrency, cn } from '@/lib/utils'

interface CalendarioDayDrawerProps {
  idSede: number
  fecha: string | null
  onClose: () => void
}

function AlertaItem({ alerta }: { alerta: AlertaDia }) {
  const config = {
    DANGER: { cls: 'bg-red-50 border-red-200 text-red-700', icon: AlertTriangle },
    WARNING: { cls: 'bg-amber-50 border-amber-200 text-amber-700', icon: AlertTriangle },
    INFO: { cls: 'bg-blue-50 border-blue-200 text-blue-700', icon: Info },
  }[alerta.nivel]
  const Icon = config.icon
  return (
    <div className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-xs', config.cls)}>
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      {alerta.mensaje}
    </div>
  )
}

function TurnoCard({
  turno,
  label,
  horario,
  turnoKey,
  fecha,
}: {
  turno: ResumenTurno
  label: string
  horario: string
  turnoKey: string
  fecha: string
}) {
  const Icon = turnoKey === 'T1' ? Sun : Sunset
  return (
    <div
      className={cn(
        'rounded-xl border p-3 space-y-1.5',
        turno.eventoPrivado
          ? 'border-brand-rosa/30 bg-brand-rosa/5'
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
            turno.disponible && !turno.eventoPrivado
              ? 'bg-green-100 text-green-800'
              : turno.eventoPrivado
              ? 'bg-brand-rosa/15 text-brand-rosa'
              : 'bg-orange-100 text-orange-800'
          )}
        >
          {turno.disponible && !turno.eventoPrivado
            ? 'Disponible'
            : turno.eventoPrivado
            ? 'Evento privado'
            : 'Ocupado'}
        </Badge>
      </div>

      {turno.disponible && !turno.eventoPrivado && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[11px] px-2 rounded-lg gap-1 w-full"
          asChild
        >
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
              <Users className="h-3 w-3" />
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
          <Ticket className="h-3 w-3" />
          {turno.totalReservas} reservas
        </p>
      )}
    </div>
  )
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

export function CalendarioDayDrawer({ idSede, fecha, onClose }: CalendarioDayDrawerProps) {
  const { data, isLoading } = useResumenDia(idSede, fecha)
  const bloquear = useBloquearFechas()
  const [confirmarBloqueo, setConfirmarBloqueo] = useState(false)

  if (!fecha) return null

  function handleConfirmarBloqueo() {
    if (!fecha) return
    bloquear.mutate(
      {
        idSede,
        fechaInicio: fecha,
        fechaFin: fecha,
        tipoBloqueo: 'CIERRE_ESPECIAL',
        motivo: 'Bloqueo manual',
      },
      { onSettled: () => setConfirmarBloqueo(false) }
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[400px] bg-gray-50 shadow-2xl flex flex-col animate-slide-in">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-black text-gray-900 capitalize">
              {format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <p className="text-xs text-gray-400">{format(parseISO(fecha), 'yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading && <DrawerSkeleton />}

          {data && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    icon: Ticket,
                    label: 'Reservas',
                    value: data.totalReservas,
                    color: 'bg-brand-azul/10 text-brand-azul',
                  },
                  {
                    icon: PartyPopper,
                    label: 'Eventos',
                    value: data.totalEventos,
                    color: 'bg-brand-rosa/10 text-brand-rosa',
                  },
                  {
                    icon: TrendingUp,
                    label: 'Ingresos',
                    value: formatCurrency(data.ingresoEstimado, 0),
                    color: 'bg-green-100 text-green-700',
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                    <div className={cn('w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center', color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-black text-gray-900">{value}</p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {data.alertas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Alertas
                  </p>
                  {data.alertas.map((a, i) => (
                    <AlertaItem key={i} alerta={a} />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Acciones rapidas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs"
                    asChild
                  >
                    <Link href={`/admin/reservas?fecha=${fecha}`}>
                      <Ticket className="h-3.5 w-3.5" />
                      Nueva reserva
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs"
                    asChild
                  >
                    <Link href={`/admin/eventos/nuevo?fecha=${fecha}`}>
                      <PartyPopper className="h-3.5 w-3.5" />
                      Nuevo evento
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="col-span-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-1.5 text-xs"
                    onClick={() => setConfirmarBloqueo(true)}
                    disabled={bloquear.isPending}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Bloquear este dia
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Turnos
                </p>
                <TurnoCard
                  turno={data.turnoT1}
                  label="Manana"
                  horario="10:00 - 14:00"
                  turnoKey="T1"
                  fecha={fecha}
                />
                <TurnoCard
                  turno={data.turnoT2}
                  label="Tarde"
                  horario="16:00 - 20:00"
                  turnoKey="T2"
                  fecha={fecha}
                />
              </div>

              {data.reservas.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Reservas publicas
                    </p>
                    <Link
                      href={`/admin/reservas?fecha=${fecha}`}
                      className="text-[11px] text-brand-azul font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      Ver todas <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    {data.reservas.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-3.5 w-3.5 text-brand-azul" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{r.nombreNino}</p>
                          <p className="text-[11px] text-gray-400 font-mono truncate">{r.numeroTicket}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {r.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.eventos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Eventos privados
                  </p>
                  <div className="bg-white rounded-xl border border-brand-rosa/20 divide-y divide-gray-50 overflow-hidden">
                    {data.eventos.map((e) => (
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
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {e.turno}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.pagosPendientes > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Pagos pendientes</p>
                    <p className="text-[11px] text-amber-700">
                      {formatCurrency(data.pagosPendientes)} por cobrar
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Gastos del dia
                </p>
                <GastosOperativosDia idSede={idSede} fecha={fecha} />
              </div>
            </div>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmarBloqueo}
        onOpenChange={setConfirmarBloqueo}
        title="Bloquear este dia"
        description={`Se bloqueara el acceso publico para el ${format(parseISO(fecha), "d 'de' MMMM", { locale: es })}. Esta accion se puede revertir desde la gestion de bloqueos.`}
        confirmLabel="Bloquear"
        onConfirm={handleConfirmarBloqueo}
        loading={bloquear.isPending}
      />
    </>
  )
}
