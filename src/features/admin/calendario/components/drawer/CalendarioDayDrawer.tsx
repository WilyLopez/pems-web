'use client'

import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Loader2 } from 'lucide-react'
import { useResumenDia, useBloquearFechas } from '../../hooks/useCalendarData'
import { Disponibilidad } from '../../types'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { isPast, isCurrentWeek } from '../../utils/date-helpers'
import { useCalendarNav } from '../../hooks/useCalendarNav'
import { GastosOperativosDia } from '@/features/admin/finance'

import { DrawerStats } from './DrawerStats'
import { DrawerAlerts } from './DrawerAlerts'
import { DrawerActions } from './DrawerActions'
import { DrawerTurnoCard } from './DrawerTurnoCard'
import { DrawerReservationsList } from './DrawerReservationsList'
import { DrawerEventsList } from './DrawerEventsList'

interface CalendarioDayDrawerProps {
  idSede: number
  fecha: string | null
  disp?: Disponibilidad
  onClose: () => void
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

export const CalendarioDayDrawer = React.memo(({ idSede, fecha, disp, onClose }: CalendarioDayDrawerProps) => {
  const { data, isLoading } = useResumenDia(idSede, fecha)
  const bloquear = useBloquearFechas()
  const { modal, openModal } = useCalendarNav()

  if (!fecha) return null

  const date = parseISO(fecha)
  const esPasado = isPast(date)
  const esSemanaBloqueada = !esPasado && isCurrentWeek(date)

  const tieneActividad = (data?.totalReservas ?? 0) > 0 || (data?.totalEventos ?? 0) > 0

  function handleConfirmarBloqueo() {
    if (!fecha || !data) return
    bloquear.mutate(
      {
        idSede,
        fechaInicio: fecha,
        fechaFin: fecha,
        tipoBloqueo: 'CIERRE_ESPECIAL',
        motivo: 'Bloqueo manual desde panel lateral',
        confirmado: tieneActividad,
      },
      { onSettled: () => openModal(null) }
    )
  }

  const esPrivado = disp?.tipoOcupacion === 'PRIVADO_PARCIAL' || disp?.tipoOcupacion === 'PRIVADO_LLENO'
  const bloqueado = disp?.tipoOcupacion === 'BLOQUEADO' || disp?.tipoOcupacion === 'FERIADO'

  return (
    <>

      <div
        className="fixed inset-0 z-[40]"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-[50] h-full w-[400px] max-w-full bg-gray-50 shadow-2xl flex flex-col animate-slide-in border-l border-gray-100">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-black text-gray-900 capitalize">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <p className="text-xs text-gray-400">{format(date, 'yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading && <DrawerSkeleton />}

          {data && (
            <div className="p-5 space-y-4">
              <DrawerStats
                reservas={data.totalReservas}
                eventos={data.totalEventos}
                ingresos={data.ingresoEstimado}
              />

              {esSemanaBloqueada && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Programacion semanal activa. No se permiten nuevos eventos privados para esta semana.
                </div>
              )}

              <DrawerAlerts alertas={data.alertas} />

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Acciones rapidas</p>
                <DrawerActions
                  fecha={fecha}
                  disp={disp}
                  onBloquear={() => openModal('confirmar-bloqueo')}
                  bloqueandoPending={bloquear.isPending}
                  esPasado={esPasado}
                  esSemanaBloqueada={esSemanaBloqueada}
                />
              </div>

              {!esPrivado && !bloqueado && (data.totalReservas === 0) && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Turnos</p>
                  <DrawerTurnoCard
                    turno={data.turnoT1}
                    label="Mañana"
                    horario="10:00 - 14:00"
                    turnoKey="T1"
                    fecha={fecha}
                    esPasado={esPasado}
                    esSemanaBloqueada={esSemanaBloqueada}
                  />
                  <DrawerTurnoCard
                    turno={data.turnoT2}
                    label="Tarde"
                    horario="16:00 - 20:00"
                    turnoKey="T2"
                    fecha={fecha}
                    esPasado={esPasado}
                    esSemanaBloqueada={esSemanaBloqueada}
                  />
                </div>
              )}

              <DrawerReservationsList reservas={data.reservas} fecha={fecha} />
              <DrawerEventsList eventos={data.eventos} />

              {data.pagosPendientes > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Pagos pendientes</p>
                    <p className="text-[11px] text-amber-700">{data.pagosPendientes} por cobrar</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Gastos del dia</p>
                <GastosOperativosDia idSede={idSede} fecha={fecha} />
              </div>
            </div>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={modal === 'confirmar-bloqueo'}
        onOpenChange={(v) => !v && openModal(null)}
        title={tieneActividad ? 'Advertencia: Dia con actividad' : 'Bloquear este dia'}
        description={
          tieneActividad
            ? `Este dia tiene ${data?.totalReservas} reservas y ${data?.totalEventos} eventos. Si bloqueas, deberas gestionar estas actividades manualmente. ¿Deseas continuar?`
            : `Se bloqueara el acceso publico para el ${format(parseISO(fecha), "d 'de' MMMM", { locale: es })}. Esta accion se puede revertir desde la gestion de bloqueos.`
        }
        confirmLabel={tieneActividad ? 'Bloquear de todos modos' : 'Bloquear'}
        onConfirm={handleConfirmarBloqueo}
        loading={bloquear.isPending}
        destructive={tieneActividad}
      />
    </>
  )
})

CalendarioDayDrawer.displayName = 'CalendarioDayDrawer'