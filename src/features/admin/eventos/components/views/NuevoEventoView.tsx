'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  format,
  addDays,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { useTurnos } from '../../hooks/useEventos'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { BotonTurno } from '@/components/admin/eventos/BotonTurno'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ADMIN_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

const DAYS_HEADER = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const TURNO_DISP: Record<string, (d: Disponibilidad) => boolean> = {
  T1: (d) => d.turnoT1Disponible,
  T2: (d) => d.turnoT2Disponible,
}

export function NuevoEventoView() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { idSede }   = useAuth()

  const { data: config }  = useConfiguracionCalendario(idSede ?? 0)
  const { data: turnos, isLoading: loadingTurnos } = useTurnos(idSede ?? 0)

  const diasMin = config?.diasMinEventoPrivado ?? 15
  const diasMax = config?.diasMaxEventoPrivado ?? 365

  const fechaParam   = searchParams.get('fecha')
  const idTurnoParam = searchParams.get('idTurno')

  const [currentDate, setCurrentDate] = useState(() => {
    if (fechaParam) return parseISO(fechaParam)
    return addDays(new Date(), diasMin)
  })
  const [fechaSel,   setFechaSel]   = useState<string | null>(fechaParam)
  const [idTurnoSel, setIdTurnoSel] = useState<number | null>(
    idTurnoParam ? parseInt(idTurnoParam) : null
  )

  const minDate = format(addDays(new Date(), diasMin), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), diasMax), 'yyyy-MM-dd')

  const inicio = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const fin    = format(endOfWeek(endOfMonth(currentDate),   { weekStartsOn: 0 }), 'yyyy-MM-dd')

  const { data: disponibilidades, isLoading: loadingDisp } = useDisponibilidadRango(idSede ?? 0, inicio, fin)

  if (!idSede) {
    return <ErrorState message="No tienes sede asignada. Contacta al administrador." />
  }

  const days        = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) })
  const startOffset = getDay(startOfMonth(currentDate))

  const getDisp = (day: Date): Disponibilidad | undefined =>
    disponibilidades?.find((d) => isSameDay(parseISO(d.fecha), day))

  const esFechaHabilitada = (day: Date): boolean => {
    const f = format(day, 'yyyy-MM-dd')
    if (f < minDate || f > maxDate) return false
    const disp = getDisp(day)
    if (!disp) return false
    return disp.turnoT1Disponible || disp.turnoT2Disponible
  }

  const dispSel = fechaSel ? disponibilidades?.find((d) => d.fecha === fechaSel) : undefined

  const handleContinuar = () => {
    if (!fechaSel || !idTurnoSel) return
    router.push(`/admin/eventos/nuevo/formulario?fecha=${fechaSel}&idTurno=${idTurnoSel}`)
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Eventos', href: ADMIN_ROUTES.eventos },
          { label: 'Nuevo evento' },
        ]}
      />
      <PageHeader
        title="Nuevo evento privado"
        description="Selecciona la fecha y el turno para el evento"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-gray-900 dark:text-gray-100 capitalize text-base">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl dark:border-gray-700 dark:text-gray-300"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl dark:border-gray-700 dark:text-gray-300"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {config && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Disponible desde {format(addDays(new Date(), diasMin), "d 'de' MMMM", { locale: es })} hasta{' '}
              {format(addDays(new Date(), diasMax), "d 'de' MMMM yyyy", { locale: es })}.
            </p>
          )}

          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS_HEADER.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {loadingDisp ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`e-${i}`} className="h-12 rounded-xl bg-gray-50/40 dark:bg-gray-800/40" />
              ))}
              {days.map((day) => {
                const habilitado   = esFechaHabilitada(day)
                const f            = format(day, 'yyyy-MM-dd')
                const seleccionado = fechaSel === f
                const hoy          = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    disabled={!habilitado}
                    onClick={() => { setFechaSel(f); setIdTurnoSel(null) }}
                    className={cn(
                      'h-12 w-full rounded-xl border text-sm font-bold transition-all',
                      seleccionado
                        ? 'bg-brand-rosa text-white border-brand-rosa'
                        : habilitado
                        ? 'border-gray-200 hover:border-brand-rosa/50 hover:bg-brand-rosa/5 text-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-brand-rosa/50 dark:hover:bg-brand-rosa/10'
                        : 'border-transparent bg-gray-50/60 text-gray-300 cursor-not-allowed dark:bg-gray-800/60 dark:text-gray-600',
                      hoy && !seleccionado && habilitado && 'border-brand-azul/40 dark:border-brand-azul/50'
                    )}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {fechaSel && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Fecha seleccionada</p>
                <p className="font-black text-gray-900 dark:text-gray-100 capitalize mt-1">
                  {format(parseISO(fechaSel), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Selecciona el turno</p>
                {loadingTurnos ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(turnos ?? []).map((turno) => {
                      const disponible = dispSel ? (TURNO_DISP[turno.codigo]?.(dispSel) ?? false) : false
                      return (
                        <BotonTurno
                          key={turno.id}
                          label={turno.nombre}
                          horario={`${turno.horaInicio}-${turno.horaFin}`}
                          turnoKey={turno.codigo as 'T1' | 'T2'}
                          disponible={disponible}
                          seleccionado={idTurnoSel === turno.id}
                          onClick={() => setIdTurnoSel(turno.id)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {!fechaSel && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px]">
              <PartyPopper className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Selecciona una fecha en el calendario para ver los turnos disponibles.
              </p>
            </div>
          )}

          <Button
            className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-2xl font-bold py-3"
            disabled={!fechaSel || !idTurnoSel}
            onClick={handleContinuar}
          >
            Continuar al formulario
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
