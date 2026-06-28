'use client'

import React, { useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  startOfDay,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  X,
  CalendarCheck,
} from 'lucide-react'

import {
  useCrearProgramacion,
  useCancelarProgramacion,
  useProgramaciones,
  useDisponibilidadRango,
} from '../../hooks/useCalendarData'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'

interface ProgramacionSemanalModalProps {
  idSede: number
  open: boolean
  onClose: () => void
}

export const ProgramacionSemanalModal = React.memo(
  ({ idSede, open, onClose }: ProgramacionSemanalModalProps) => {
    const [semanaBase, setSemanaBase] = useState(() => new Date())
    const hoy = startOfDay(new Date())

    const inicioSemana = startOfWeek(semanaBase, { weekStartsOn: 1 })
    const finSemana = endOfWeek(semanaBase, { weekStartsOn: 1 })
    const inicio = format(inicioSemana, 'yyyy-MM-dd')
    const fin = format(finSemana, 'yyyy-MM-dd')

    const { data: disponibilidad, isLoading: loadingDisp } =
      useDisponibilidadRango(idSede, inicio, fin)
    const { data: programaciones, isLoading: loadingList } =
      useProgramaciones(idSede)

    const crear = useCrearProgramacion(idSede)
    const cancelar = useCancelarProgramacion(idSede)

    const inicioSemanaActual = startOfWeek(hoy, { weekStartsOn: 1 })
    const esSemanaPasada = inicioSemana < inicioSemanaActual
    const esSemanaActual =
      inicioSemana.getTime() === inicioSemanaActual.getTime()
    const yaProgramada =
      disponibilidad?.some((d) => d.tieneProgramacionSemanal) ?? false

    const diasConEvento =
      disponibilidad?.filter((d) => d.totalEventos > 0) ?? []
    const tieneEventos = diasConEvento.length > 0
    const diasSemana = Array.from({ length: 7 }).map((_, i) =>
      addDays(inicioSemana, i)
    )

    const handleAplicar = () => {
      if (esSemanaPasada || yaProgramada) return
      crear.mutate(
        { semanaInicio: inicio, semanaFin: fin },
        { onSuccess: () => onClose() }
      )
    }

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl max-h-[90vh] flex flex-col">
          {/* ── Header ── */}
          <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-4.5 w-4.5 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-gray-900 leading-none">
                  Programación semanal
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Gestiona qué semanas abren reservas públicas
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-6 pt-5 pb-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Semanas programadas
              </p>

              <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-3">
                <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-700 leading-relaxed">
                  Si no programas una semana manualmente, el sistema la activa
                  automáticamente cada lunes a las 00:01.
                </p>
              </div>

              {loadingList ? (
                <div className="flex items-center gap-2 py-4 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Cargando programaciones...</span>
                </div>
              ) : !programaciones?.length ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl px-4 py-5 text-center">
                  <p className="text-xs font-semibold text-gray-400">
                    No hay semanas programadas aún.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    El sistema las activará automáticamente cada lunes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {programaciones.map((p) => {
                    const semanaInicioDate = parseISO(p.semanaInicio)
                    const semanaFinDate = parseISO(p.semanaFin)
                    const isFin = semanaFinDate.getTime() < hoy.getTime()
                    const yaInicio = semanaInicioDate.getTime() <= hoy.getTime()
                    const isActual =
                      yaInicio && semanaFinDate.getTime() >= hoy.getTime()
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          'flex items-center justify-between gap-3 bg-white border rounded-xl px-4 py-3',
                          isActual ? 'border-green-200' : 'border-gray-100'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              isActual ? 'bg-green-500' : 'bg-blue-400'
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {format(parseISO(p.semanaInicio), 'd MMM', {
                                locale: es,
                              })}
                              {' — '}
                              {format(parseISO(p.semanaFin), 'd MMM yyyy', {
                                locale: es,
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {isActual ? 'Semana en curso' : 'Próxima'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {p.autoGenerada && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 text-orange-600 border-orange-200 bg-orange-50/60 gap-1"
                            >
                              <Zap className="h-2.5 w-2.5" />
                              AUTO
                            </Badge>
                          )}
                          {!yaInicio && (
                            <button
                              onClick={() => cancelar.mutate(p.id)}
                              disabled={cancelar.isPending}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Cancelar programación"
                            >
                              {cancelar.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mx-6 border-t border-gray-100" />

            <div className="px-6 pt-4 pb-6 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Seleccionar semana
              </p>

              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100"
                  onClick={() => setSemanaBase((prev) => subWeeks(prev, 1))}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </Button>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-900 capitalize">
                    {format(inicioSemana, 'd MMM', { locale: es })} —{' '}
                    {format(finSemana, 'd MMM yyyy', { locale: es })}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                    Semana seleccionada
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100"
                  onClick={() => setSemanaBase((prev) => addWeeks(prev, 1))}
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              {loadingDisp ? (
                <div className="flex items-center justify-center py-8 gap-2 bg-white rounded-xl border border-gray-100">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                </div>
              ) : esSemanaPasada ? (
                <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center text-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-300" />
                  <p className="text-xs font-bold text-gray-500">
                    Semana finalizada
                  </p>
                  <p className="text-[11px] text-gray-400">
                    No se pueden hacer cambios en periodos pasados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Grid de días — siempre visible para semanas no pasadas */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {diasSemana.map((d) => {
                      const fStr = format(d, 'yyyy-MM-dd')
                      const disp = disponibilidad?.find((x) => x.fecha === fStr)
                      const hayEvento = (disp?.totalEventos ?? 0) > 0
                      return (
                        <div
                          key={fStr}
                          className={cn(
                            'flex flex-col items-center text-center rounded-xl border px-1.5 py-3 bg-white',
                            hayEvento
                              ? 'border-pink-200 ring-1 ring-pink-100'
                              : 'border-gray-100 shadow-sm'
                          )}
                        >
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 capitalize">
                            {format(d, 'EEE', { locale: es })}
                          </p>
                          <p className="text-base font-black text-gray-900 my-1.5">
                            {format(d, 'd')}
                          </p>
                          <span
                            className={cn(
                              'text-[8px] font-black uppercase leading-none px-1.5 py-0.5 rounded-md',
                              hayEvento
                                ? 'bg-pink-50 text-pink-600'
                                : 'bg-green-50 text-green-700'
                            )}
                          >
                            {hayEvento ? 'Evento' : 'Libre'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {esSemanaActual && !yaProgramada && (
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        Estás programando la <strong>semana en curso</strong>.
                        Las reservas públicas se habilitarán inmediatamente para
                        los días restantes.
                      </p>
                    </div>
                  )}

                  {tieneEventos && (
                    <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Esta semana tiene {diasConEvento.length}{' '}
                        {diasConEvento.length === 1
                          ? 'celebración pactada'
                          : 'celebraciones pactadas'}
                        . La programación habilita la venta pública sin afectar
                        los eventos privados.
                      </p>
                    </div>
                  )}

                  {yaProgramada ? (
                    <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-2.5 w-2.5 shrink-0">
                          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                          <span className="relative block h-2.5 w-2.5 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-900">
                          Esta semana ya está programada
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-black text-blue-600 border-blue-200 bg-blue-50/50 px-2 py-0.5"
                      >
                        ACTIVA
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      variant="custom"
                      onClick={handleAplicar}
                      disabled={crear.isPending}
                      style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                      className="w-full rounded-xl font-bold h-10 text-sm gap-2 transition-all active:scale-[0.98]"
                    >
                      {crear.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarPlus className="h-4 w-4" />
                      )}
                      Confirmar programación
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

ProgramacionSemanalModal.displayName = 'ProgramacionSemanalModal'
