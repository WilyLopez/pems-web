'use client'

import React, { useEffect } from 'react'
import { format, parseISO, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useResumenDia,
  useBloquearFechas,
  useConfiguracionCalendario,
} from '../../hooks/useCalendarData'
import { Disponibilidad } from '../../types'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { isPast } from '../../utils/date-helpers'
import { useCalendarNav } from '../../hooks/useCalendarNav'
import { GastosOperativosDia } from '@/features/admin/finanzas'
import { cn } from '@/lib/utils'

import { DrawerStats } from './DrawerStats'
import { DrawerAlerts } from './DrawerAlerts'
import { DrawerActions } from './DrawerActions'
import { DrawerTurnoCard } from './DrawerTurnoCard'
import { DrawerReservationsList } from './DrawerReservationsList'
import { DrawerEventsList } from './DrawerEventsList'

type DrawerMode =
  | 'PASADO'
  | 'FERIADO'
  | 'BLOQUEADO'
  | 'NO_LABORABLE'
  | 'EVENTO'
  | 'RESERVA'
  | 'LIBRE'

function resolveMode(
  esPasado: boolean,
  tipoDia?: string,
  tipoOcupacion?: string
): DrawerMode {
  if (esPasado) return 'PASADO'
  if (tipoDia === 'BLOQUEADO') return 'BLOQUEADO'
  if (tipoDia === 'NO_LABORABLE') return 'NO_LABORABLE'
  if (tipoOcupacion === 'PRIVADO_PARCIAL' || tipoOcupacion === 'PRIVADO_LLENO')
    return 'EVENTO'
  if (tipoOcupacion === 'PUBLICO') return 'RESERVA'
  return 'LIBRE'
}

const BADGE_CONFIG: Record<string, { label: string; cls: string }> = {
  PASADO: { label: 'Histórico', cls: 'bg-gray-100 text-gray-500' },
  FERIADO: { label: 'Feriado', cls: 'bg-red-50 text-red-600' },
  BLOQUEADO: { label: 'Bloqueado', cls: 'bg-gray-200 text-gray-600' },
  NO_LABORABLE: { label: 'No laborable', cls: 'bg-orange-50 text-orange-700' },
  EVENTO: { label: 'Evento privado', cls: 'bg-pink-50 text-pink-700' },
  RESERVA: { label: 'Reservas activas', cls: 'bg-blue-50 text-blue-700' },
  LIBRE_PROG: { label: 'Disponible', cls: 'bg-green-50 text-green-700' },
  LIBRE_NOPROG: { label: 'Sin programar', cls: 'bg-amber-50 text-amber-700' },
}

function fmtTurno(inicio?: string, fin?: string) {
  if (!inicio || !fin) return ''
  return `${inicio.substring(0, 5)} – ${fin.substring(0, 5)}`
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

function PagosBanner({ count }: { count: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
      <div>
        <p className="text-xs font-bold text-amber-800">Pagos pendientes</p>
        <p className="text-[11px] text-amber-700">{count} por cobrar</p>
      </div>
    </div>
  )
}

function GastosSection({ idSede, fecha }: { idSede: number; fecha: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Gastos del día
      </p>
      <GastosOperativosDia idSede={idSede} fecha={fecha} />
    </div>
  )
}

interface CalendarioDayDrawerProps {
  idSede: number
  fecha: string | null
  disp?: Disponibilidad
  onClose: () => void
}

export const CalendarioDayDrawer = React.memo(
  ({ idSede, fecha, disp, onClose }: CalendarioDayDrawerProps) => {
    const { data, isLoading } = useResumenDia(idSede, fecha)
    const { data: config } = useConfiguracionCalendario(idSede)
    const bloquear = useBloquearFechas()
    const { modal, openModal, selectDate } = useCalendarNav()

    const date = fecha ? parseISO(fecha) : new Date()

    useEffect(() => {
      if (!fecha) return
      const handle = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
          return
        }
        if (e.key === 'ArrowLeft') selectDate(subDays(date, 1))
        if (e.key === 'ArrowRight') selectDate(addDays(date, 1))
      }
      window.addEventListener('keydown', handle)
      return () => window.removeEventListener('keydown', handle)
    }, [fecha])

    if (!fecha) return null
    const esPasado = isPast(date)
    const tieneProgramacion =
      !esPasado && (disp?.tieneProgramacionSemanal ?? false)
    const disponiblePrivado = disp?.disponiblePrivado ?? false

    const mode = resolveMode(esPasado, disp?.tipoDia, disp?.tipoOcupacion)

    const badgeKey =
      mode === 'LIBRE'
        ? tieneProgramacion
          ? 'LIBRE_PROG'
          : 'LIBRE_NOPROG'
        : mode
    const badge =
      mode === 'FERIADO' && disp?.descripcionFeriado
        ? { label: disp.descripcionFeriado, cls: BADGE_CONFIG.FERIADO.cls }
        : BADGE_CONFIG[badgeKey]

    const tieneActividad =
      (data?.totalReservas ?? 0) > 0 || (data?.totalEventos ?? 0) > 0

    const turnoT1Horario = fmtTurno(config?.turnoT1Inicio, config?.turnoT1Fin)
    const turnoT2Horario = fmtTurno(config?.turnoT2Inicio, config?.turnoT2Fin)

    const sharedActions = (
      <DrawerActions
        fecha={fecha}
        disp={disp}
        onBloquear={() => openModal('confirmar-bloqueo')}
        bloqueandoPending={bloquear.isPending}
        esPasado={esPasado}
        tieneProgramacion={tieneProgramacion}
        tieneActividad={tieneActividad}
        totalReservas={data?.totalReservas ?? 0}
        totalEventos={data?.totalEventos ?? 0}
      />
    )

    const turnoSection = (
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Turnos
        </p>
        <DrawerTurnoCard
          turno={
            data?.turnoT1 ?? {
              disponible: false,
              totalReservas: 0,
              eventoPrivado: null,
            }
          }
          label="Turno 1 — Mañana"
          horario={turnoT1Horario}
          turnoKey="T1"
          fecha={fecha}
          esPasado={esPasado}
          disponiblePrivado={disponiblePrivado}
        />
        <DrawerTurnoCard
          turno={
            data?.turnoT2 ?? {
              disponible: false,
              totalReservas: 0,
              eventoPrivado: null,
            }
          }
          label="Turno 2 — Tarde"
          horario={turnoT2Horario}
          turnoKey="T2"
          fecha={fecha}
          esPasado={esPasado}
          disponiblePrivado={disponiblePrivado}
        />
      </div>
    )

    function handleConfirmarBloqueo() {
      if (!fecha || !data) return
      bloquear.mutate(
        {
          idSede,
          fechaInicio: fecha,
          fechaFin: fecha,
          tipoBloqueo: 'CIERRE_ESPECIAL',
          motivo: 'Bloqueo manual desde panel lateral',
          confirmado: false,
        },
        { onSettled: () => openModal(null) }
      )
    }

    return (
      <>
        <div
          className="fixed inset-0 z-[40] bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <aside className="fixed right-0 top-0 z-[50] h-full w-1/3 min-w-[380px] max-w-[520px] bg-gray-50 shadow-2xl flex flex-col animate-slide-in border-l border-gray-100">
          <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => selectDate(subDays(date, 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => selectDate(addDays(date, 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap',
                    badge.cls
                  )}
                >
                  {badge.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h2 className="font-black text-gray-900 leading-tight">
              {format(date, "EEEE d 'de' MMMM", { locale: es }).replace(
                /^\w/,
                (c) => c.toUpperCase()
              )}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(date, 'yyyy')}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading && <DrawerSkeleton />}

            {data && (
              <div className="p-5 space-y-4">
                {mode === 'PASADO' && (
                  <>
                    <DrawerStats
                      reservas={data.totalReservas}
                      eventos={data.totalEventos}
                      ingresos={data.ingresoEstimado}
                    />
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                    <DrawerReservationsList
                      reservas={data.reservas}
                      fecha={fecha}
                    />
                    <DrawerEventsList eventos={data.eventos} />
                    {tieneActividad && (
                      <GastosSection idSede={idSede} fecha={fecha} />
                    )}
                  </>
                )}

                {(mode === 'BLOQUEADO' || mode === 'FERIADO') && (
                  <>
                    {tieneActividad && (
                      <DrawerStats
                        reservas={data.totalReservas}
                        eventos={data.totalEventos}
                        ingresos={data.ingresoEstimado}
                      />
                    )}
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                  </>
                )}

                {mode === 'NO_LABORABLE' && (
                  <>
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                  </>
                )}

                {mode === 'EVENTO' && (
                  <>
                    <DrawerStats
                      reservas={data.totalReservas}
                      eventos={data.totalEventos}
                      ingresos={data.ingresoEstimado}
                    />
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                    {turnoSection}
                    <DrawerEventsList eventos={data.eventos} />
                    {data.pagosPendientes > 0 && (
                      <PagosBanner count={data.pagosPendientes} />
                    )}
                    <GastosSection idSede={idSede} fecha={fecha} />
                  </>
                )}

                {mode === 'RESERVA' && (
                  <>
                    <DrawerStats
                      reservas={data.totalReservas}
                      eventos={data.totalEventos}
                      ingresos={data.ingresoEstimado}
                    />
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                    <DrawerReservationsList
                      reservas={data.reservas}
                      fecha={fecha}
                    />
                    {data.pagosPendientes > 0 && (
                      <PagosBanner count={data.pagosPendientes} />
                    )}
                    <GastosSection idSede={idSede} fecha={fecha} />
                  </>
                )}

                {mode === 'LIBRE' && (
                  <>
                    <DrawerStats
                      reservas={data.totalReservas}
                      eventos={data.totalEventos}
                      ingresos={data.ingresoEstimado}
                    />
                    <DrawerAlerts alertas={data.alertas} />
                    {sharedActions}
                    {turnoSection}
                    {data.pagosPendientes > 0 && (
                      <PagosBanner count={data.pagosPendientes} />
                    )}
                    <GastosSection idSede={idSede} fecha={fecha} />
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        <ConfirmDialog
          open={modal === 'confirmar-bloqueo'}
          onOpenChange={(v) => !v && openModal(null)}
          title="Bloquear este día"
          description={`Se bloqueará el acceso público para el ${format(parseISO(fecha), "d 'de' MMMM", { locale: es })}. Esta acción se puede revertir desde la gestión de bloqueos.`}
          confirmLabel="Bloquear"
          onConfirm={handleConfirmarBloqueo}
          loading={bloquear.isPending}
          destructive
        />
      </>
    )
  }
)

CalendarioDayDrawer.displayName = 'CalendarioDayDrawer'
