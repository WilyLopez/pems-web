'use client'

import React, { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPlus, Loader2, ChevronLeft, ChevronRight, Info, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { useBloquearFechas, useDisponibilidadRango } from '../../hooks/useCalendarData'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'

interface ProgramacionSemanalModalProps {
  idSede: number
  open: boolean
  onClose: () => void
}

export const ProgramacionSemanalModal = React.memo(({
  idSede,
  open,
  onClose
}: ProgramacionSemanalModalProps) => {
  const [semanaBase, setSemanaBase] = useState(new Date())
  const hoy = startOfDay(new Date())

  const inicioSemana = startOfWeek(semanaBase, { weekStartsOn: 1 })
  const finSemana = endOfWeek(semanaBase, { weekStartsOn: 1 })

  const inicio = format(inicioSemana, 'yyyy-MM-dd')
  const fin = format(finSemana, 'yyyy-MM-dd')

  const { data: disponibilidad, isLoading } = useDisponibilidadRango(idSede, inicio, fin)
  const bloquear = useBloquearFechas()

  const esSemanaPasada = inicioSemana < startOfWeek(hoy, { weekStartsOn: 1 })
  const esSemanaActual = isSameWeek(inicioSemana, hoy, { weekStartsOn: 1 })

  const diasConEvento = disponibilidad?.filter(d => d.totalEventos > 0) ?? []
  const tieneEventos = diasConEvento.length > 0

  const handleAplicar = () => {
    if (esSemanaPasada || esSemanaActual) return
    bloquear.mutate(
      {
        idSede,
        fechaInicio: inicio,
        fechaFin: fin,
        tipoBloqueo: 'PLANIFICACION_SEMANAL',
        motivo: 'Programacion semanal del local',
        confirmado: true,
      },
      {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          const msg = err?.response?.data?.mensaje ?? 'Error al aplicar la programacion.'
          toast.error(msg)
        },
      }
    )
  }

  const diasSemana = Array.from({ length: 7 }).map((_, i) => addDays(inicioSemana, i))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl">

        <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <CalendarPlus className="h-4.5 w-4.5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-gray-900 leading-none">
                Programacion semanal
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-1">Gestion de disponibilidad por semana</p>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gray-50/40 px-6 py-5 space-y-5">

          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-gray-100"
              onClick={() => setSemanaBase(prev => subWeeks(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-black text-gray-900 capitalize">
                {format(inicioSemana, 'd MMM', { locale: es })} — {format(finSemana, 'd MMM yyyy', { locale: es })}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                Semana seleccionada
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-gray-100"
              onClick={() => setSemanaBase(prev => addWeeks(prev, 1))}
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white rounded-xl border border-gray-100">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Consultando disponibilidad</p>
            </div>

          ) : esSemanaPasada ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Semana finalizada</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  No se pueden realizar cambios operativos en periodos que ya concluyeron.
                </p>
              </div>
            </div>

          ) : (
            <div className="space-y-4">

              {esSemanaActual && (
                <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-2.5 w-2.5 shrink-0">
                      <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                      <span className="relative block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Programacion activa</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        Semana en curso — no se permiten cambios masivos.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black text-blue-600 border-blue-200 bg-blue-50/50 px-2 py-0.5">
                    EN CURSO
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-7 gap-1.5">
                {diasSemana.map(d => {
                  const fStr = format(d, 'yyyy-MM-dd')
                  const disp = disponibilidad?.find(x => x.fecha === fStr)
                  const hayEvento = (disp?.totalEventos ?? 0) > 0

                  return (
                    <div
                      key={fStr}
                      className={cn(
                        'flex flex-col items-center text-center rounded-xl border px-1.5 py-3 bg-white transition-all',
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
                        {hayEvento ? 'Evento' : 'Normal'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {tieneEventos && (
                <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-gray-900">Eventos privados detectados</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Esta semana tiene {diasConEvento.length} {diasConEvento.length === 1 ? 'celebracion pactada' : 'celebraciones pactadas'}. La programacion asegura su disponibilidad mientras se gestiona la venta publica.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancelar
          </Button>

          <Button
            variant="custom"
            onClick={handleAplicar}
            disabled={bloquear.isPending || esSemanaPasada || esSemanaActual}
            style={
              esSemanaPasada || esSemanaActual
                ? { backgroundColor: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb', cursor: 'not-allowed', opacity: 1 }
                : { backgroundColor: '#ea580c', color: '#ffffff', cursor: 'pointer' }
            }
            className="rounded-xl font-bold px-6 h-10 text-sm gap-2 transition-all active:scale-[0.98] disabled:!opacity-100"
          >
            {bloquear.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CalendarPlus className="h-4 w-4" />
            }
            Confirmar programacion
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
})

ProgramacionSemanalModal.displayName = 'ProgramacionSemanalModal'