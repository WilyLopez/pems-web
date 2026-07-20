'use client'

import { useMemo, useState } from 'react'
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
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { useTurnos } from '../../hooks/useEventos'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { Turno } from '../../types'
import { TURNO_DISP } from '../../utils/turnoDisponibilidad'
import { BotonTurno } from '@/components/admin/eventos/BotonTurno'
import { StepperCreacionEvento } from '../StepperCreacionEvento'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ADMIN_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

const DAYS_HEADER = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface AvisoFecha {
  tipo: 'fuera-ventana' | 'no-disponible' | 'turno-no-disponible'
  mensaje: string
}

interface ResolucionSeleccion {
  fechaSel: string | null
  idTurnoSel: number | null
  avisoFecha: AvisoFecha | null
  fueraDeVentana: boolean
}

/**
 * Resuelve fecha/turno recibidos por query param contra la ventana de
 * anticipación y la disponibilidad real — nunca se confían tal cual.
 * `forzarFueraDeVentana` solo se activa explícitamente por un admin.
 */
function resolverSeleccionDesdeParametros(params: {
  fecha: string
  idTurnoParam: string | null
  turnoCodeParam: string | null
  forzarFueraDeVentana: boolean
  turnos: Turno[]
  disponibilidades: Disponibilidad[]
  minDate: string
  maxDate: string
  diasMin: number
  diasMax: number
}): ResolucionSeleccion {
  const {
    fecha,
    idTurnoParam,
    turnoCodeParam,
    forzarFueraDeVentana,
    turnos,
    disponibilidades,
    minDate,
    maxDate,
    diasMin,
    diasMax,
  } = params

  const dentroVentana = fecha >= minDate && fecha <= maxDate
  if (!dentroVentana && !forzarFueraDeVentana) {
    return {
      fechaSel: null,
      idTurnoSel: null,
      fueraDeVentana: false,
      avisoFecha: {
        tipo: 'fuera-ventana',
        mensaje: `La fecha solicitada (${format(parseISO(fecha), "d 'de' MMMM yyyy", { locale: es })}) excede la ventana de anticipación permitida (mínimo ${diasMin}, máximo ${diasMax} días). Selecciona otra fecha en el calendario.`,
      },
    }
  }

  const dispDia = disponibilidades.find((d) => d.fecha === fecha)
  const tieneDisp = dispDia
    ? dispDia.turnoT1Disponible || dispDia.turnoT2Disponible
    : false

  if (!tieneDisp) {
    return {
      fechaSel: null,
      idTurnoSel: null,
      fueraDeVentana: false,
      avisoFecha: {
        tipo: 'no-disponible',
        mensaje: `La fecha solicitada (${format(parseISO(fecha), "d 'de' MMMM yyyy", { locale: es })}) ya no está disponible. Selecciona otra fecha en el calendario.`,
      },
    }
  }

  const turnoResuelto = idTurnoParam
    ? turnos.find((t) => t.id === parseInt(idTurnoParam))
    : turnoCodeParam
      ? turnos.find((t) => t.codigo === turnoCodeParam)
      : undefined

  const turnoDisponible =
    turnoResuelto && dispDia
      ? (TURNO_DISP[turnoResuelto.codigo]?.(dispDia) ?? false)
      : false

  if ((idTurnoParam || turnoCodeParam) && !turnoDisponible) {
    return {
      fechaSel: fecha,
      idTurnoSel: null,
      fueraDeVentana: !dentroVentana,
      avisoFecha: {
        tipo: 'turno-no-disponible',
        mensaje:
          'El turno solicitado ya no está disponible para esta fecha. Elige otro turno abajo.',
      },
    }
  }

  return {
    fechaSel: fecha,
    idTurnoSel: turnoResuelto?.id ?? null,
    fueraDeVentana: !dentroVentana,
    avisoFecha: null,
  }
}

type Seleccion =
  | { origen: 'ninguna' }
  | { origen: 'usuario'; fecha: string; idTurno: number | null }
  | { origen: 'parametros'; forzarFueraDeVentana: boolean }

export function NuevoEventoView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { idSede, isAdmin } = useAuth()

  const { data: config } = useConfiguracionCalendario(idSede ?? 0)
  const { data: turnos, isLoading: loadingTurnos } = useTurnos(idSede ?? 0)

  const diasMin = config?.diasMinEventoPrivado ?? 15
  const diasMax = config?.diasMaxEventoPrivado ?? 365

  const fechaParam = searchParams.get('fecha')
  const idTurnoParam = searchParams.get('idTurno')
  const turnoCodeParam = searchParams.get('turno')

  const [currentDate, setCurrentDate] = useState(() => {
    if (fechaParam) return parseISO(fechaParam)
    return addDays(new Date(), diasMin)
  })
  const [seleccion, setSeleccion] = useState<Seleccion>(() =>
    fechaParam
      ? { origen: 'parametros', forzarFueraDeVentana: false }
      : { origen: 'ninguna' }
  )

  const minDate = format(addDays(new Date(), diasMin), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), diasMax), 'yyyy-MM-dd')

  const inicio = format(
    startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
    'yyyy-MM-dd'
  )
  const fin = format(
    endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
    'yyyy-MM-dd'
  )

  const { data: disponibilidades, isLoading: loadingDisp } =
    useDisponibilidadRango(idSede ?? 0, inicio, fin)

  const { fechaSel, idTurnoSel, avisoFecha, fueraDeVentana } =
    useMemo((): ResolucionSeleccion => {
      if (seleccion.origen === 'ninguna') {
        return {
          fechaSel: null,
          idTurnoSel: null,
          avisoFecha: null,
          fueraDeVentana: false,
        }
      }
      if (seleccion.origen === 'usuario') {
        return {
          fechaSel: seleccion.fecha,
          idTurnoSel: seleccion.idTurno,
          avisoFecha: null,
          fueraDeVentana: false,
        }
      }
      if (!fechaParam || loadingDisp || loadingTurnos) {
        return {
          fechaSel: null,
          idTurnoSel: null,
          avisoFecha: null,
          fueraDeVentana: false,
        }
      }
      return resolverSeleccionDesdeParametros({
        fecha: fechaParam,
        idTurnoParam,
        turnoCodeParam,
        forzarFueraDeVentana: seleccion.forzarFueraDeVentana,
        turnos: turnos ?? [],
        disponibilidades: disponibilidades ?? [],
        minDate,
        maxDate,
        diasMin,
        diasMax,
      })
    }, [
      seleccion,
      fechaParam,
      idTurnoParam,
      turnoCodeParam,
      loadingDisp,
      loadingTurnos,
      turnos,
      disponibilidades,
      minDate,
      maxDate,
      diasMin,
      diasMax,
    ])

  if (!idSede) {
    return (
      <ErrorState message="No tienes sede asignada. Contacta al administrador." />
    )
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })
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

  const dispSel = fechaSel
    ? disponibilidades?.find((d) => d.fecha === fechaSel)
    : undefined

  const handleContinuar = () => {
    if (!fechaSel || !idTurnoSel) return
    router.push(
      `/admin/eventos/nuevo/formulario?fecha=${fechaSel}&idTurno=${idTurnoSel}`
    )
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
      <StepperCreacionEvento pasoActual={1} />

      {avisoFecha && (
        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 py-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold">
            {avisoFecha.tipo === 'fuera-ventana'
              ? 'Fecha fuera de la ventana permitida'
              : avisoFecha.tipo === 'no-disponible'
                ? 'Fecha no disponible'
                : 'Turno no disponible'}
          </AlertTitle>
          <AlertDescription className="text-[11px] leading-tight space-y-2 text-amber-800 dark:text-amber-300">
            <p>{avisoFecha.mensaje}</p>
            {avisoFecha.tipo === 'fuera-ventana' && isAdmin && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-lg border-amber-300 dark:border-amber-700"
                onClick={() =>
                  setSeleccion({
                    origen: 'parametros',
                    forzarFueraDeVentana: true,
                  })
                }
              >
                Continuar de todos modos (fuera de la ventana estándar, requiere
                rol administrador)
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {fueraDeVentana && fechaSel && (
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 py-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-[11px] leading-tight text-blue-800 dark:text-blue-300">
            Estás creando este evento fuera de la ventana estándar de
            anticipación, como administrador.
          </AlertDescription>
        </Alert>
      )}

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
              Disponible desde{' '}
              {format(addDays(new Date(), diasMin), "d 'de' MMMM", {
                locale: es,
              })}{' '}
              hasta{' '}
              {format(addDays(new Date(), diasMax), "d 'de' MMMM yyyy", {
                locale: es,
              })}
              .
            </p>
          )}

          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS_HEADER.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-1"
              >
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
                <div
                  key={`e-${i}`}
                  className="h-12 rounded-xl bg-gray-50/40 dark:bg-gray-800/40"
                />
              ))}
              {days.map((day) => {
                const habilitado = esFechaHabilitada(day)
                const f = format(day, 'yyyy-MM-dd')
                const seleccionado = fechaSel === f
                const hoy = isToday(day)
                const etiquetaDia = format(day, "d 'de' MMMM", { locale: es })

                return (
                  <button
                    key={day.toISOString()}
                    disabled={!habilitado}
                    aria-label={`${etiquetaDia}, ${habilitado ? 'disponible' : 'no disponible'}`}
                    onClick={() =>
                      setSeleccion({
                        origen: 'usuario',
                        fecha: f,
                        idTurno: null,
                      })
                    }
                    className={cn(
                      'h-12 w-full rounded-xl border text-sm font-bold transition-all',
                      seleccionado
                        ? 'bg-brand-rosa text-white border-brand-rosa'
                        : habilitado
                          ? 'border-gray-200 hover:border-brand-rosa/50 hover:bg-brand-rosa/5 text-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-brand-rosa/50 dark:hover:bg-brand-rosa/10'
                          : 'border-transparent bg-gray-50/60 text-gray-300 cursor-not-allowed dark:bg-gray-800/60 dark:text-gray-600',
                      hoy &&
                        !seleccionado &&
                        habilitado &&
                        'border-brand-azul/40 dark:border-brand-azul/50'
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
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Fecha seleccionada
                </p>
                <p className="font-black text-gray-900 dark:text-gray-100 capitalize mt-1">
                  {format(parseISO(fechaSel), "EEEE d 'de' MMMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Selecciona el turno
                </p>
                {loadingTurnos ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(turnos ?? []).map((turno) => {
                      const disponible = dispSel
                        ? (TURNO_DISP[turno.codigo]?.(dispSel) ?? false)
                        : false
                      return (
                        <BotonTurno
                          key={turno.id}
                          label={turno.nombre}
                          horario={`${turno.horaInicio}-${turno.horaFin}`}
                          turnoKey={turno.codigo as 'T1' | 'T2'}
                          disponible={disponible}
                          seleccionado={idTurnoSel === turno.id}
                          onClick={() =>
                            setSeleccion({
                              origen: 'usuario',
                              fecha: fechaSel,
                              idTurno: turno.id,
                            })
                          }
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
                Selecciona una fecha en el calendario para ver los turnos
                disponibles.
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
