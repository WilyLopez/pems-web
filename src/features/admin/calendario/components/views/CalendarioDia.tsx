'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Ticket,
  PartyPopper,
  TrendingUp,
  Sun,
  Sunset,
  Users,
  CreditCard,
  AlertTriangle,
  Info,
  ChevronRight,
  Lock,
  History,
} from 'lucide-react'
import Link from 'next/link'

import { useResumenDia, useBloquearFechas } from '../../hooks/useCalendarData'
import { AlertaDia, ResumenTurno, ResumenDia } from '../../types'
import { GastosOperativosDia } from '@/components/admin/finanzas/GastosOperativosDia'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { formatCurrency, cn } from '@/lib/utils'
import { isPast, isCurrentWeek } from '../../utils/date-helpers'

interface CalendarioDiaProps {
  fecha: Date
  idSede: number
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

function TurnoSection({
  turno,
  label,
  horario,
  turnoKey,
  fecha,
  esPasado,
  esSemanaBloqueada,
}: {
  turno: ResumenTurno
  label: string
  horario: string
  turnoKey: string
  fecha: string
  esPasado: boolean
  esSemanaBloqueada: boolean
}) {
  const Icon = turnoKey === 'T1' ? Sun : Sunset
  const tieneReservas = turno.totalReservas > 0
  const permitirAsignar = !esPasado && !esSemanaBloqueada && !tieneReservas

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-2',
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
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-900">{label}</span>
          <span className="text-xs text-gray-400">{horario}</span>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'text-[11px]',
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
        <Button size="sm" variant="outline" className="h-7 text-xs px-3 rounded-lg gap-1.5 w-full" asChild>
          <Link href={`/admin/eventos/nuevo?fecha=${fecha}&turno=${turnoKey}`}>
            <PartyPopper className="h-3.5 w-3.5" />
            Asignar evento
          </Link>
        </Button>
      )}

      {turno.eventoPrivado && (
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">{turno.eventoPrivado.tipoEvento}</p>
          <p>{turno.eventoPrivado.nombreCliente}</p>
          {turno.eventoPrivado.aforoDeclarado && (
            <p className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {turno.eventoPrivado.aforoDeclarado} invitados
            </p>
          )}
          <Link
            href={`/admin/eventos/${turno.eventoPrivado.id}`}
            className="inline-flex items-center gap-0.5 text-brand-azul hover:underline font-semibold"
          >
            Ver evento <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {!turno.eventoPrivado && turno.totalReservas > 0 && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Ticket className="h-3.5 w-3.5" />
          {turno.totalReservas} reservas
        </p>
      )}
    </div>
  )
}

function DiaSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  )
}

export const CalendarioDia = React.memo(({ fecha, idSede }: CalendarioDiaProps) => {
  const fechaStr = format(fecha, 'yyyy-MM-dd')
  const { data, isLoading } = useResumenDia(idSede, fechaStr)
  const bloquear = useBloquearFechas()
  const [confirmarBloqueo, setConfirmarBloqueo] = useState(false)

  const esPasado = isPast(fecha)
  const esSemanaBloqueada = !esPasado && isCurrentWeek(fecha)

  if (isLoading) return <DiaSkeleton />

  const resumen = data as ResumenDia | undefined

  if (!resumen) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-sm text-gray-400">No hay informacion disponible para este dia.</p>
        {esPasado ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-brand-azul/30 text-brand-azul hover:bg-brand-azul/5 rounded-xl gap-1.5 text-xs" asChild>
              <Link href={`/admin/reservas?fecha=${fechaStr}`}>
                <Ticket className="h-3.5 w-3.5" />
                Ver reservas
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="border-brand-rosa/30 text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs" asChild>
              <Link href={`/admin/eventos?fecha=${fechaStr}`}>
                <PartyPopper className="h-3.5 w-3.5" />
                Ver eventos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs" asChild>
              <Link href={`/admin/reservas?fecha=${fechaStr}`}>
                <Ticket className="h-3.5 w-3.5" />
                Nueva reserva
              </Link>
            </Button>
            {!esSemanaBloqueada && (
              <Button size="sm" variant="outline" className="border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs" asChild>
                <Link href={`/admin/eventos/nuevo?fecha=${fechaStr}`}>
                  <PartyPopper className="h-3.5 w-3.5" />
                  Nuevo evento
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const tieneActividad = resumen.totalReservas > 0 || resumen.totalEventos > 0
  const tieneAtencionActiva = resumen.aforoPublicoActual > 0

  function handleIntentarBloqueo() {
    if (tieneAtencionActiva) return
    setConfirmarBloqueo(true)
  }

  function handleConfirmarBloqueo() {
    bloquear.mutate(
      {
        idSede,
        fechaInicio: fechaStr,
        fechaFin: fechaStr,
        tipoBloqueo: 'CIERRE_ESPECIAL',
        motivo: 'Bloqueo manual desde vista diaria',
        confirmado: tieneActividad,
      },
      { onSettled: () => setConfirmarBloqueo(false) }
    )
  }

  const esPrivado = resumen.totalEventos > 0
  const bloqueado = resumen.tipoOcupacion === 'BLOQUEADO' || resumen.tipoOcupacion === 'FERIADO'
  const aforeoPct = resumen.aforoMaximo > 0
    ? Math.round((resumen.aforoPublicoActual / resumen.aforoMaximo) * 100)
    : 0
  const barColor =
    aforeoPct >= 90 ? 'bg-red-500' : aforeoPct >= 70 ? 'bg-orange-400' : aforeoPct >= 40 ? 'bg-yellow-400' : 'bg-green-500'

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
        <div className="lg:col-span-2 space-y-4">
          {esPasado && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <History className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-xs font-semibold text-gray-500">
                Fecha historica. Puedes consultar pero no realizar acciones operativas.
              </p>
            </div>
          )}

          {esSemanaBloqueada && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Programacion semanal activa. No se permiten nuevos eventos privados para esta semana.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Resumen del dia</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Ticket, label: 'Reservas', value: resumen.totalReservas, color: 'bg-brand-azul/10 text-brand-azul' },
                { icon: PartyPopper, label: 'Eventos', value: resumen.totalEventos, color: 'bg-brand-rosa/10 text-brand-rosa' },
                { icon: TrendingUp, label: 'Ingresos', value: formatCurrency(resumen.ingresoEstimado, 0), color: 'bg-green-100 text-green-700' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={cn('w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-base font-black text-gray-900">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            {resumen.aforoMaximo > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Aforo publico</span>
                  <span className="font-semibold">{resumen.aforoPublicoActual} / {resumen.aforoMaximo}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={cn('h-2 rounded-full transition-all', barColor)}
                    style={{ width: `${Math.min(aforeoPct, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {!esPrivado && !bloqueado && (resumen.totalReservas === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Turnos</p>
              <TurnoSection turno={resumen.turnoT1} label="Mañana" horario="10:00 - 14:00" turnoKey="T1" fecha={fechaStr} esPasado={esPasado} esSemanaBloqueada={esSemanaBloqueada} />
              <TurnoSection turno={resumen.turnoT2} label="Tarde" horario="16:00 - 20:00" turnoKey="T2" fecha={fechaStr} esPasado={esPasado} esSemanaBloqueada={esSemanaBloqueada} />
            </div>
          )}

          {resumen.reservas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Reservas</p>
                <Link
                  href={`/admin/reservas?fecha=${fechaStr}`}
                  className="text-[11px] text-brand-azul font-semibold flex items-center gap-0.5 hover:underline"
                >
                  Ver todas <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {resumen.reservas.slice(0, 8).map((r) => (
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
          )}

          {resumen.eventos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Eventos privados</p>
              <div className="rounded-xl border border-brand-rosa/20 divide-y divide-gray-50 overflow-hidden">
                {resumen.eventos.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center shrink-0">
                      <PartyPopper className="h-3.5 w-3.5 text-brand-rosa" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{e.tipoEvento}</p>
                      <p className="text-[11px] text-gray-400 truncate">{e.nombreCliente} — {e.horaInicio}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{e.turno}</Badge>
                      <Link href={`/admin/eventos/${e.id}`} className="text-brand-azul hover:underline">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {esPasado ? 'Consulta rapida' : 'Acciones rapidas'}
            </p>
            {esPasado ? (
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="border-brand-azul/30 text-brand-azul hover:bg-brand-azul/5 rounded-xl gap-1.5 text-xs w-full" asChild>
                  <Link href={`/admin/reservas?fecha=${fechaStr}`}>
                    <Ticket className="h-3.5 w-3.5" />
                    Ver reservas del dia
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="border-brand-rosa/30 text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs w-full" asChild>
                  <Link href={`/admin/eventos?fecha=${fechaStr}`}>
                    <PartyPopper className="h-3.5 w-3.5" />
                    Ver eventos del dia
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl gap-1.5 text-xs w-full" asChild>
                  <Link href={`/admin/reservas?fecha=${fechaStr}`}>
                    <Ticket className="h-3.5 w-3.5" />
                    Nueva reserva
                  </Link>
                </Button>
                {!esSemanaBloqueada && (resumen.totalReservas === 0) && (
                  <Button size="sm" variant="outline" className="border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 rounded-xl gap-1.5 text-xs w-full" asChild>
                    <Link href={`/admin/eventos/nuevo?fecha=${fechaStr}`}>
                      <PartyPopper className="h-3.5 w-3.5" />
                      Nuevo evento
                    </Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "rounded-xl gap-1.5 text-xs w-full",
                    tieneAtencionActiva 
                      ? "border-gray-200 text-gray-400 cursor-not-allowed" 
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  )}
                  onClick={handleIntentarBloqueo}
                  disabled={bloquear.isPending || tieneAtencionActiva}
                  title={tieneAtencionActiva ? 'No se puede bloquear un dia con atencion activa' : ''}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Bloquear este dia
                </Button>
              </div>
            )}
          </div>

          {resumen.alertas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Alertas</p>
              <div className="space-y-2">
                {resumen.alertas.map((a, i) => (
                  <AlertaItem key={i} alerta={a} />
                ))}
              </div>
            </div>
          )}

          {resumen.pagosPendientes > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Pagos pendientes</p>
                <p className="text-[11px] text-amber-700">{formatCurrency(resumen.pagosPendientes)} por cobrar</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Gastos del dia</p>
            <GastosOperativosDia idSede={idSede} fecha={fechaStr} />
          </div>
        </div>
      </div>

      {!esPasado && (
        <ConfirmDialog
          open={confirmarBloqueo}
          onOpenChange={setConfirmarBloqueo}
          title={tieneActividad ? 'Advertencia: Dia con actividad' : 'Bloquear este dia'}
          description={
            tieneActividad
              ? `Este dia tiene ${resumen.totalReservas} reservas y ${resumen.totalEventos} eventos. Si bloqueas, deberas gestionar estas actividades manualmente. ¿Deseas continuar?`
              : `Se bloqueara el acceso publico para el ${format(fecha, "d 'de' MMMM", { locale: es })}. Esta accion se puede revertir desde la gestion de bloqueos.`
          }
          confirmLabel={tieneActividad ? 'Bloquear de todos modos' : 'Bloquear'}
          onConfirm={handleConfirmarBloqueo}
          loading={bloquear.isPending}
          destructive={tieneActividad}
        />
      )}
    </>
  )
})

CalendarioDia.displayName = 'CalendarioDia'
