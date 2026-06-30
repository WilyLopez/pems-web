import { useState, useCallback } from 'react'
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  parse,
  addDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Lock, Ticket } from 'lucide-react'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { Skeleton } from '../../shared/Skeletons'
import { PrecioLabel } from './PrecioLabel'
import { cn } from '@/lib/utils'

interface CalendarStepProps {
  idSede: number
  fechaSeleccionada: string | null
  setFecha: (fecha: string | null) => void
  dispSeleccionada: Disponibilidad | null
  setDispSeleccionada: (disp: Disponibilidad | null) => void
  config: any
  precioMap: Record<string, number> | undefined
  getTarifaKey: (fechaStr: string, esFeriado: boolean) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  onAvanzar: () => void
}

export function CalendarStep({
  idSede,
  fechaSeleccionada,
  setFecha,
  dispSeleccionada,
  setDispSeleccionada,
  config,
  precioMap,
  getTarifaKey,
  onAvanzar,
}: CalendarStepProps) {
  const [semanaOffset, setSemanaOffset] = useState(0)

  const diasMax = config?.diasMaxReservaPublica ?? 14
  const horaApertura = config?.horaApertura ?? '10:00'
  const horaCierre = config?.horaCierre ?? '20:00'
  const semanasMax = Math.ceil(diasMax / 7)

  const hoyYaCerro = (fecha: string) =>
    isToday(parseISO(fecha)) &&
    isAfter(new Date(), parse(horaCierre, 'HH:mm', new Date()))

  const semanaInicio = startOfWeek(addWeeks(new Date(), semanaOffset), {
    weekStartsOn: 1,
  })
  const semanaFin = endOfWeek(semanaInicio, { weekStartsOn: 1 })

  const { data: disponibilidades, isLoading: loadingDisp } =
    useDisponibilidadRango(
      idSede,
      format(semanaInicio, 'yyyy-MM-dd'),
      format(semanaFin, 'yyyy-MM-dd')
    )

  const dias = eachDayOfInterval({ start: semanaInicio, end: semanaFin })

  const getDisp = useCallback(
    (dia: Date): Disponibilidad | undefined =>
      disponibilidades?.find((d) => d.fecha === format(dia, 'yyyy-MM-dd')),
    [disponibilidades]
  )

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Selecciona una fecha
        </h1>
        <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
          Elige el día en que deseas visitar Kiki y Lala
        </p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed font-semibold">
          Puedes reservar hasta con {diasMax} días de anticipación.
          Atención de {horaApertura} a {horaCierre}.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 capitalize text-sm">
            {format(semanaInicio, "'Semana del' d 'de' MMMM yyyy", {
              locale: es,
            })}
          </h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSemanaOffset((o) => o - 1)}
              disabled={semanaOffset <= 0}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white hover:bg-gray-50 shadow-sm animate-fade-in"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setSemanaOffset((o) => o + 1)}
              disabled={semanaOffset >= semanasMax - 1}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white hover:bg-gray-50 shadow-sm animate-fade-in"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {loadingDisp ? (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {dias.map((dia) => {
              const disp = getDisp(dia)
              const hoy = startOfDay(new Date())
              const pasado = isBefore(dia, hoy)
              const fechaStr = format(dia, 'yyyy-MM-dd')
              const cerroHoy = hoyYaCerro(fechaStr)

              const minReservaDia = startOfDay(
                addDays(hoy, config?.diasMinReservaPublica ?? 0)
              )
              const maxReservaDia = startOfDay(
                addDays(hoy, config?.diasMaxReservaPublica ?? 14)
              )
              const fueraDeRango =
                isBefore(dia, minReservaDia) ||
                isAfter(dia, maxReservaDia)

              const disabled =
                pasado ||
                fueraDeRango ||
                !disp ||
                !disp.disponiblePublico ||
                cerroHoy
              const seleccionado = fechaSeleccionada === fechaStr

              return (
                <button
                  key={dia.toISOString()}
                  disabled={disabled}
                  onClick={() => {
                    setFecha(fechaStr)
                    setDispSeleccionada(disp ?? null)
                  }}
                  className={cn(
                    'relative h-20 sm:h-24 w-full rounded-xl sm:rounded-2xl border p-1.5 xs:p-2 flex flex-col gap-0.5 transition-all text-left duration-200',
                    seleccionado &&
                    'border-brand-azul bg-brand-azul/8 ring-2 ring-brand-azul/10 shadow-sm scale-95',
                    !seleccionado &&
                    !disabled &&
                    'hover:border-brand-azul/45 hover:bg-brand-azul/4 border-gray-200 bg-white hover:shadow-sm',
                    disabled &&
                    'opacity-35 cursor-not-allowed bg-gray-50 border-gray-100',
                    isToday(dia) &&
                    !seleccionado &&
                    'border-brand-rosa/40'
                  )}
                >
                  <span className="text-[8px] xs:text-[9px] font-black text-gray-400 uppercase tracking-wide">
                    {format(dia, 'EEE', { locale: es })}
                  </span>
                  <span
                    className={cn(
                      'text-sm xs:text-base sm:text-lg font-black leading-none mt-0.5',
                      seleccionado && 'text-brand-azul',
                      isToday(dia) &&
                      !seleccionado &&
                      'text-brand-rosa',
                      !seleccionado &&
                      !isToday(dia) &&
                      'text-gray-800'
                    )}
                  >
                    {format(dia, 'd')}
                  </span>
                  {disp && !disabled && (
                    <span className="text-[8px] xs:text-[9px] text-green-600 font-bold mt-1 leading-none">
                      {disp.plazasDisponibles}
                      <span className="hidden xs:inline"> pl.</span>
                    </span>
                  )}
                  {disp && !disabled && (
                    <span className="text-[8px] xs:text-[9px] font-black text-brand-azul mt-auto leading-none">
                      S/
                      {Number(
                        precioMap
                          ? (precioMap[
                            getTarifaKey(fechaStr, disp.esFeriado)
                          ] ??
                            (getTarifaKey(
                              fechaStr,
                              disp.esFeriado
                            ) === 'SEMANA'
                              ? 25
                              : 35))
                          : getTarifaKey(fechaStr, disp.esFeriado) ===
                            'SEMANA'
                            ? 25
                            : 35
                      ).toFixed(0)}
                    </span>
                  )}
                  {disabled &&
                    !pasado &&
                    (disp?.tipoOcupacion === 'PRIVADO_PARCIAL' ||
                      disp?.tipoOcupacion === 'PRIVADO_LLENO') && (
                      <Lock className="h-3 w-3 text-brand-rosa mt-auto shrink-0" />
                    )}
                  {disabled &&
                    !pasado &&
                    disp?.aforoCompleto &&
                    disp?.tipoOcupacion !== 'PRIVADO_PARCIAL' &&
                    disp?.tipoOcupacion !== 'PRIVADO_LLENO' && (
                      <span className="text-[8px] xs:text-[9px] text-red-500 font-bold mt-auto leading-none">
                        Lleno
                      </span>
                    )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {fechaSeleccionada && dispSeleccionada && (
        <div className="p-5 bg-brand-azul/5 border border-brand-azul/20 rounded-3xl space-y-4 shadow-sm animate-fade-in">
          <p className="text-xs font-black uppercase tracking-wider text-brand-azul leading-none">
            Tu selección
          </p>
          <p className="font-black text-gray-900 text-lg capitalize">
            {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM", {
              locale: es,
            })}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-bold">
              {dispSeleccionada.plazasDisponibles} plazas disponibles
            </span>
            <PrecioLabel
              tipoDia={getTarifaKey(
                fechaSeleccionada,
                dispSeleccionada.esFeriado
              )}
              precioMap={precioMap}
            />
          </div>
          <button
            onClick={onAvanzar}
            className="w-full py-3 bg-brand-azul text-white rounded-xl font-bold text-sm hover:bg-brand-azul/90 transition-colors shadow-sm shadow-blue-100"
          >
            Confirmar fecha y continuar
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-black text-gray-800 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Ticket className="h-4 w-4 text-brand-azul shrink-0" />
          Cómo funciona el proceso
        </p>
        <ol className="space-y-2.5 text-xs text-gray-500 list-none">
          {[
            'Elige la fecha disponible en el calendario.',
            'Completa los datos del niño y del acompañante adulto.',
            'Selecciona tu método de pago preferido (Yape o Pago en Local).',
            'Recibe tu ticket de ingreso con código QR en formato PDF.',
          ].map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-brand-azul text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm shadow-blue-50">
                {i + 1}
              </span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
