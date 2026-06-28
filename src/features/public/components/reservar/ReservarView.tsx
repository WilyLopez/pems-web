'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Ticket,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Loader2,
  Download,
  Zap,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { useWizardTimer } from '@/hooks/useWizardTimer'
import { usePublicPrecios } from '../../hooks/usePublicPrecios'
import { usePublicConfig } from '../../hooks/usePublicConfig'
import { useSedesPublicas } from '../../hooks/useSedesPublicas'
import { getReservationSchema } from '../../shared/validations'
import { Skeleton } from '../shared/Skeletons'
import { reservaService } from '@/services/reserva.service'
import { downloadFile } from '@/utils/download.utils'
import { Reserva } from '@/features/admin/reservas/types'
import { Disponibilidad } from '@/features/admin/calendario/types'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { WizardHeader } from '@/components/wizard/WizardHeader'
import { cn } from '@/lib/utils'

type MedioPago = 'YAPE' | 'CAJA'
type PasoReserva = 1 | 2 | 3 | 4

interface ReservaFormValues {
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  aceptaReglamento: boolean
  conoceActa: boolean
}

function StepIndicator({ paso }: { paso: PasoReserva }) {
  const pasos = [
    { n: 1, label: 'Seleccionar Fecha', desc: 'Elige tu día' },
    { n: 2, label: 'Datos del Visitante', desc: 'Niño y acompañante' },
    { n: 3, label: 'Método de Pago', desc: 'Completa la reserva' },
  ]

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
        {pasos.map((p, i) => {
          const isActive = paso === p.n
          const isCompleted = paso > p.n

          return (
            <div key={p.n} className="flex-1 flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shadow-sm text-sm shrink-0',
                    isCompleted
                      ? 'bg-green-500 text-white shadow-green-100'
                      : isActive
                        ? 'bg-brand-azul text-white shadow-blue-100 scale-105'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : p.n}
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      'text-xs font-black uppercase tracking-wider leading-none',
                      isActive
                        ? 'text-brand-azul'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                    )}
                  >
                    {p.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {p.desc}
                  </p>
                </div>
              </div>

              {i < pasos.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] mx-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isCompleted ? 'bg-green-500 w-full' : 'bg-gray-100 w-0'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuthGuard({ fecha }: { fecha: string | null }) {
  const callbackUrl = fecha
    ? `/cliente/reservar?fecha=${fecha}`
    : '/cliente/reservar'
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-brand-azul/10 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-brand-azul" />
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Inicia sesión para reservar
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Necesitas una cuenta para comprar tu entrada a la zona de juegos.
        </p>
        <Link
          href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 bg-brand-azul text-white rounded-2xl font-bold text-sm text-center hover:bg-brand-azul/90 transition-colors shadow-sm shadow-blue-100"
        >
          Iniciar sesión
        </Link>
        <Link
          href={`/auth/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  )
}

function PrecioLabel({
  tipoDia,
  precioMap,
}: {
  tipoDia?: string
  precioMap?: Record<string, number>
}) {
  const precio =
    tipoDia && precioMap
      ? (precioMap[tipoDia] ?? (tipoDia === 'SEMANA' ? 25 : 35))
      : tipoDia === 'SEMANA'
        ? 25
        : 35
  return (
    <span className="font-black text-brand-azul">
      S/ {Number(precio).toFixed(2)}
    </span>
  )
}

export function ReservarView() {
  const searchParams = useSearchParams()
  const {
    clientePerfilId,
    correo,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth()
  const { idSedeUnica, isLoading: sedesLoading } = useSedesPublicas()
  const idSede = idSedeUnica ?? 0

  const [paso, setPaso] = useState<PasoReserva>(1)
  const [fechaSeleccionada, setFecha] = useState<string | null>(null)
  const [dispSeleccionada, setDispSeleccionada] =
    useState<Disponibilidad | null>(null)
  const [semanaOffset, setSemanaOffset] = useState(0)

  const { data: config } = useConfiguracionCalendario(idSede)
  const { data: preciosPublicos } = usePublicPrecios(idSede)
  const { data: publicConfig } = usePublicConfig()

  // Extraer edades dinámicas del reglamento de la configuración
  const { minAge, maxAge } = useMemo(() => {
    let min = 0
    let max = 12 // Default standard maximum as per business rules
    if (publicConfig?.reglasLocal) {
      try {
        const parsed = JSON.parse(publicConfig.reglasLocal)
        if (parsed.edadMinima !== undefined) min = Number(parsed.edadMinima)
        if (parsed.edadMaxima !== undefined) max = Number(parsed.edadMaxima)
      } catch {
        // Ignorar error y usar defaults
      }
    }
    return { minAge: min, maxAge: max }
  }, [publicConfig])

  // Crear el esquema dynamic schema
  const dynamicSchema = useMemo(() => {
    return getReservationSchema(minAge, maxAge)
  }, [minAge, maxAge])

  const precioMap: Record<string, number> | undefined = preciosPublicos
    ? Object.fromEntries(
        preciosPublicos.map((p) => [p.tipoDia, Number(p.precio)])
      )
    : undefined

  const getTarifaKey = useCallback(
    (fechaStr: string, esFeriado: boolean): 'SEMANA' | 'FIN_SEMANA_FERIADO' => {
      const date = parseISO(fechaStr)
      const day = date.getDay()
      const isWeekend = day === 0 || day === 6
      return isWeekend || esFeriado ? 'FIN_SEMANA_FERIADO' : 'SEMANA'
    },
    []
  )

  const diasMax = config?.diasMaxReservaPublica ?? 14
  const horaApertura = config?.horaApertura ?? '10:00'
  const horaCierre = config?.horaCierre ?? '20:00'
  const semanasMax = Math.ceil(diasMax / 7)

  const hoyYaCerro = (fecha: string) =>
    isToday(parseISO(fecha)) &&
    isAfter(new Date(), parse(horaCierre, 'HH:mm', new Date()))

  const [metodoPago, setMetodoPago] = useState<MedioPago | null>(null)
  const [codigoYape, setCodigoYape] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [reservaCreada, setReservaCreada] = useState<Reserva | null>(null)

  // Shared wizard timer — starts paused, activates when user enters paso 2
  const prevPasoRef = useRef<PasoReserva>(1)
  const reservaCreadaRef = useRef<Reserva | null>(null)
  reservaCreadaRef.current = reservaCreada

  const {
    secondsLeft,
    progress: timerProgress,
    phase: timerPhase,
    displayTime: timerDisplay,
    restart: restartTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useWizardTimer({
    durationSeconds: 600,
    sessionKey: 'reservar_session_timer',
    startPaused: true,
    onExpire: () => {
      toast.error(
        'El tiempo límite para realizar la reserva ha expirado. Por favor, inicia el proceso nuevamente.',
        {
          duration: 5000,
        }
      )
      const reserva = reservaCreadaRef.current
      if (reserva && reserva.estado === 'PENDIENTE') {
        reservaService
          .cancelar(reserva.id, 'Expiración de tiempo de reserva de 10 minutos')
          .catch((e) =>
            console.error('Error al cancelar la reserva expirada:', e)
          )
      }
      setPaso(1)
      setFecha(null)
      setDispSeleccionada(null)
      setReservaCreada(null)
      setMetodoPago(null)
      setComprobante(null)
      setCodigoYape('')
      setIntentoEnvio(false)
    },
  })

  // Control timer lifecycle based on wizard step
  useEffect(() => {
    const prev = prevPasoRef.current
    prevPasoRef.current = paso

    if (paso === 2 && prev === 1) {
      restartTimer() // fresh 10 min when date is confirmed
    } else if (paso === 1 || paso === 4) {
      pauseTimer()
    } else {
      resumeTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  const timerActivo = paso === 2 || paso === 3

  useEffect(() => {
    const fecha = searchParams.get('fecha')
    if (fecha) {
      setFecha(fecha)
      setPaso(2)
    }
  }, [searchParams])

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

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(dynamicSchema),
  })

  const watchedValues = watch()

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem('pems_reserva_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (parsed.nombreNino) setValue('nombreNino', parsed.nombreNino)
        if (parsed.edadNino) setValue('edadNino', Number(parsed.edadNino))
        if (parsed.nombreAcompanante)
          setValue('nombreAcompanante', parsed.nombreAcompanante)
        if (parsed.dniAcompanante)
          setValue('dniAcompanante', parsed.dniAcompanante)
      } catch (e) {
        console.error('Error parsing draft from localStorage:', e)
      }
    }
  }, [setValue])

  // Save draft
  useEffect(() => {
    if (
      watchedValues.nombreNino ||
      watchedValues.edadNino ||
      watchedValues.nombreAcompanante ||
      watchedValues.dniAcompanante
    ) {
      localStorage.setItem(
        'pems_reserva_draft',
        JSON.stringify({
          nombreNino: watchedValues.nombreNino,
          edadNino: watchedValues.edadNino,
          nombreAcompanante: watchedValues.nombreAcompanante,
          dniAcompanante: watchedValues.dniAcompanante,
        })
      )
    }
  }, [watchedValues])

  const crear = useMutation({
    mutationFn: (payload: Parameters<typeof reservaService.crear>[2]) =>
      reservaService.crear(clientePerfilId!, idSede, payload),
    onSuccess: async (reserva) => {
      localStorage.removeItem('pems_reserva_draft')
      if (metodoPago === 'YAPE' && comprobante) {
        try {
          await reservaService.subirComprobante(reserva.id, comprobante)
        } catch {
          toast.error('Reserva creada pero no se pudo subir el comprobante.')
        }
      }
      setReservaCreada(reserva)
      setPaso(4)
    },
    onError: (err: { message?: string }) => {
      toast.error(
        err?.message ?? 'No se pudo crear la reserva. Intenta nuevamente.'
      )
    },
  })

  if (authLoading || sedesLoading) return null
  if (!isAuthenticated) return <AuthGuard fecha={fechaSeleccionada} />

  async function confirmarReserva() {
    setIntentoEnvio(true)
    if (!metodoPago) return
    if (metodoPago === 'YAPE' && !comprobante) return

    const valores = getValues()
    crear.mutate({
      canalReserva: 'WEB',
      fechaEvento: fechaSeleccionada!,
      nombreNino: valores.nombreNino,
      edadNino: valores.edadNino,
      nombreAcompanante: valores.nombreAcompanante,
      dniAcompanante: valores.dniAcompanante,
      firmoConsentimiento: true,
    })
  }

  if (paso === 4 && reservaCreada) {
    return (
      <div className="container max-w-xl mx-auto px-4 pt-24 pb-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm shadow-green-50 animate-bounce">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              Reserva confirmada
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tu ticket ha sido generado exitosamente
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                Ticket
              </span>
              <span className="font-mono font-black text-brand-azul text-base">
                {reservaCreada.numeroTicket}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estado</span>
              <span
                className={cn(
                  'text-xs font-bold px-3 py-1 rounded-full shadow-sm',
                  reservaCreada.estado === 'PENDIENTE'
                    ? 'bg-amber-100 text-amber-800'
                    : reservaCreada.estado === 'CANCELADA'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                )}
              >
                {{
                  PENDIENTE: 'Pendiente de pago',
                  CONFIRMADA: 'Confirmada',
                  CANCELADA: 'Cancelada',
                }[reservaCreada.estado] ?? reservaCreada.estado}
              </span>
            </div>
            <div className="border-t border-gray-200/80 pt-3 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Fecha</span>
                <span className="font-semibold text-gray-800">
                  {format(
                    parseISO(reservaCreada.fechaEvento),
                    "d 'de' MMMM yyyy",
                    { locale: es }
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Niño</span>
                <span className="font-semibold text-gray-800">
                  {reservaCreada.nombreNino}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total</span>
                <span className="font-black text-green-700">
                  S/ {reservaCreada.totalPagado}
                </span>
              </div>
            </div>
          </div>

          {reservaCreada.estado === 'PENDIENTE' && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left">
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                {reservaCreada.medioPago === 'YAPE'
                  ? 'Comprobante recibido. Nuestro equipo lo validará en los próximos minutos.'
                  : 'Recuerda pagar en caja al llegar al local para confirmar tu ingreso.'}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 leading-relaxed">
            Recibirás un correo con tu ticket en PDF en{' '}
            <strong className="text-gray-800 font-bold">{correo}</strong>
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={async () => {
                try {
                  await downloadFile(
                    `/reservas/${reservaCreada.id}/ticket`,
                    `ticket-${reservaCreada.numeroTicket}.pdf`
                  )
                  toast.success('Ticket descargado exitosamente')
                } catch {
                  toast.error('Error al descargar el ticket en PDF')
                }
              }}
              className="w-full py-3 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-100"
            >
              <Download className="h-5 w-5" />
              Descargar Ticket PDF
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaso(1)
                  setFecha(null)
                  setDispSeleccionada(null)
                  setReservaCreada(null)
                  setMetodoPago(null)
                  setComprobante(null)
                  setCodigoYape('')
                  setIntentoEnvio(false)
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Nueva reserva
              </button>
              <Link
                href="/cliente/mis-reservas"
                className="flex-1 py-2.5 bg-brand-rosa text-white rounded-xl font-bold text-sm text-center hover:bg-brand-rosa/90 transition-colors shadow-sm shadow-pink-105"
              >
                Mis reservas
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {timerActivo && (
        <WizardHeader
          titulo="Reservar entrada"
          secondsLeft={secondsLeft}
          timerProgress={timerProgress}
          timerPhase={timerPhase}
          timerDisplay={timerDisplay}
          className="top-16"
        />
      )}
      <div
        className={cn(
          'container max-w-7xl mx-auto px-4 pt-24 pb-12',
          timerActivo && 'pb-28 lg:pb-12'
        )}
      >
        <StepIndicator paso={paso} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main flow content */}
          <div className="lg:col-span-2 space-y-6">
            {timerActivo && timerPhase !== 'safe' && (
              <div
                className={cn(
                  'p-4 rounded-2xl flex items-center gap-3 border transition-all duration-300 shadow-sm',
                  timerPhase === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-900 animate-pulse'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'h-5 w-5 shrink-0',
                    timerPhase === 'critical'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  )}
                />
                <p className="text-sm font-semibold">
                  {timerPhase === 'critical'
                    ? `¡Completa tu reserva pronto! Tiempo restante: ${timerDisplay}`
                    : `Tu sesión expira en ${timerDisplay}. Completa los datos antes de que se agote.`}
                </p>
              </div>
            )}

            {paso === 1 && (
              <div className="space-y-5">
                <div className="mb-2">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Selecciona una fecha
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
                    Elige el día en que deseas visitar Kiki y Lala
                  </p>
                  <p className="text-xs text-gray-405 mt-1 leading-relaxed font-semibold">
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
                                <Lock className="h-3 w-3 text-pink-450 mt-auto shrink-0" />
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
                      <span className="text-sm text-gray-650 font-bold">
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
                      onClick={() => setPaso(2)}
                      className="w-full py-3 bg-brand-azul text-white rounded-xl font-bold text-sm hover:bg-brand-azul/90 transition-colors shadow-sm shadow-blue-100"
                    >
                      Confirmar fecha y continuar
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-black text-gray-805 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
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
            )}

            {paso === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setPaso(1)}
                    className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors bg-white shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">
                      Datos del visitante
                    </h1>
                    {fechaSeleccionada && (
                      <p className="text-sm text-gray-500 capitalize leading-relaxed mt-0.5">
                        {format(
                          parseISO(fechaSeleccionada),
                          "EEEE d 'de' MMMM yyyy",
                          { locale: es }
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(() => setPaso(3))}
                  className="space-y-5"
                >
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-gray-900 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                      <span className="w-6 h-6 rounded-lg bg-brand-azul text-white text-xs font-black flex items-center justify-center shadow-sm shadow-blue-50">
                        1
                      </span>
                      Datos del niño (Edad permitida: {minAge} a {maxAge} años)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Nombre completo del niño{' '}
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <Input
                          placeholder="Valentina Garcia"
                          className={cn(
                            'h-11 rounded-xl focus:border-brand-azul',
                            errors.nombreNino && 'border-red-400'
                          )}
                          {...register('nombreNino')}
                        />
                        {errors.nombreNino && (
                          <p className="flex items-center gap-1 text-xs text-red-650 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.nombreNino.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Edad <span className="text-red-500 font-bold">*</span>
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={17}
                          placeholder="5"
                          className={cn(
                            'h-11 rounded-xl focus:border-brand-azul',
                            errors.edadNino && 'border-red-400'
                          )}
                          {...register('edadNino', { valueAsNumber: true })}
                        />
                        {errors.edadNino && (
                          <p className="flex items-center gap-1 text-xs text-red-650 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.edadNino.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-gray-900 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                      <span className="w-6 h-6 rounded-lg bg-brand-azul text-white text-xs font-black flex items-center justify-center shadow-sm shadow-blue-50">
                        2
                      </span>
                      Acompañante adulto responsable
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Nombre completo{' '}
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <Input
                          placeholder="Tu nombre completo"
                          className={cn(
                            'h-11 rounded-xl focus:border-brand-azul',
                            errors.nombreAcompanante && 'border-red-400'
                          )}
                          {...register('nombreAcompanante')}
                        />
                        {errors.nombreAcompanante && (
                          <p className="flex items-center gap-1 text-xs text-red-650 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.nombreAcompanante.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          DNI <span className="text-red-500 font-bold">*</span>
                        </label>
                        <Input
                          placeholder="12345678"
                          maxLength={8}
                          className={cn(
                            'h-11 rounded-xl font-mono focus:border-brand-azul',
                            errors.dniAcompanante && 'border-red-400'
                          )}
                          {...register('dniAcompanante')}
                        />
                        <p className="text-[10px] text-gray-400">
                          8 dígitos numéricos
                        </p>
                        {errors.dniAcompanante && (
                          <p className="flex items-center gap-1 text-xs text-red-650 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.dniAcompanante.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-amber-900 flex items-center gap-2 text-sm uppercase tracking-wider leading-none">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                      Compromisos obligatorios
                    </h3>

                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Controller
                          name="aceptaReglamento"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="reglamento"
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-amber-300 data-[state=checked]:bg-amber-650"
                            />
                          )}
                        />
                        <span className="text-xs text-gray-800 leading-relaxed font-medium">
                          He leído y acepto el{' '}
                          <Link
                            href="/zona-de-juegos"
                            target="_blank"
                            className="text-brand-azul underline font-bold hover:text-brand-azul/80"
                          >
                            Reglamento del local
                          </Link>
                          , incluyendo las normas de conducta, restricciones de
                          edad y responsabilidades del acompañante adulto.
                          <span className="text-red-500 font-bold"> *</span>
                        </span>
                      </label>
                      {errors.aceptaReglamento && (
                        <p className="flex items-center gap-1 text-xs text-red-650 ml-7">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.aceptaReglamento.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Controller
                          name="conoceActa"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="acta"
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-amber-300 data-[state=checked]:bg-amber-650"
                            />
                          )}
                        />
                        <span className="text-xs text-gray-800 leading-relaxed font-medium">
                          Entiendo que debo firmar el{' '}
                          <a
                            href="/legal/acta-responsabilidad"
                            target="_blank"
                            className="text-brand-azul underline font-bold hover:text-brand-azul/80"
                          >
                            Acta de Responsabilidad
                          </a>{' '}
                          físicamente en recepción antes de que el niño ingrese
                          al local.
                          <span className="text-red-500 font-bold"> *</span>
                        </span>
                      </label>
                      {errors.conoceActa && (
                        <p className="flex items-center gap-1 text-xs text-red-655 ml-7">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.conoceActa.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {fechaSeleccionada && dispSeleccionada && (
                      <p className="text-sm text-gray-550 font-bold lg:hidden">
                        Total:{' '}
                        <PrecioLabel
                          tipoDia={getTarifaKey(
                            fechaSeleccionada,
                            dispSeleccionada.esFeriado
                          )}
                          precioMap={precioMap}
                        />
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="ml-auto bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl px-6 py-2.5 shadow-sm shadow-blue-100 flex items-center gap-1.5"
                    >
                      Continuar al pago
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setPaso(2)}
                    className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors bg-white shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    Método de pago
                  </h1>
                </div>

                {/* Mobile Summary Box */}
                <div className="lg:hidden bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Resumen de tu reserva
                  </p>
                  {fechaSeleccionada && (
                    <p className="font-black text-gray-800 text-sm capitalize">
                      {format(
                        parseISO(fechaSeleccionada),
                        "EEEE d 'de' MMMM yyyy",
                        { locale: es }
                      )}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Niño: {getValues('nombreNino')}
                  </p>
                  <div className="border-t border-gray-200/80 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-semibold">
                      Total a pagar
                    </span>
                    <PrecioLabel
                      tipoDia={getTarifaKey(
                        fechaSeleccionada!,
                        dispSeleccionada!.esFeriado
                      )}
                      precioMap={precioMap}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card Yape */}
                    <button
                      type="button"
                      onClick={() => setMetodoPago('YAPE')}
                      className={cn(
                        'relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-300 hover:shadow-md flex flex-col',
                        metodoPago === 'YAPE'
                          ? 'border-[#6E2FEC] ring-4 ring-[#6E2FEC]/10 bg-[#6E2FEC]/5 scale-[1.01]'
                          : 'border-gray-200 bg-white hover:border-[#6E2FEC]/35'
                      )}
                    >
                      <div className="relative h-44 w-full bg-purple-50">
                        <Image
                          src="/metodo-pago-yape.png"
                          alt="Pagar con Yape"
                          fill
                          className="object-cover"
                          sizes="(max-w-768px) 100vw, 50vw"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1 shadow-sm z-10">
                          <input
                            type="radio"
                            name="metodoPago"
                            checked={metodoPago === 'YAPE'}
                            onChange={() => setMetodoPago('YAPE')}
                            className="h-4.5 w-4.5 accent-[#6E2FEC] cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-black text-gray-900 text-base">
                            Pagar con Yape
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Transfiere de forma rápida desde tu celular subiendo
                            la captura del comprobante.
                          </p>
                        </div>
                        <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider text-[#6E2FEC] bg-[#6E2FEC]/10 px-2.5 py-1 rounded-lg w-fit">
                          Confirmación rápida
                        </span>
                      </div>
                    </button>

                    {/* Card Caja/Local */}
                    <button
                      type="button"
                      onClick={() => setMetodoPago('CAJA')}
                      className={cn(
                        'relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-300 hover:shadow-md flex flex-col',
                        metodoPago === 'CAJA'
                          ? 'border-brand-azul ring-4 ring-brand-azul/10 bg-brand-azul/5 scale-[1.01]'
                          : 'border-gray-200 bg-white hover:border-brand-azul/35'
                      )}
                    >
                      <div className="relative h-44 w-full bg-blue-50">
                        <Image
                          src="/metodo-pago-local.png"
                          alt="Pagar en Local"
                          fill
                          className="object-cover"
                          sizes="(max-w-768px) 100vw, 50vw"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1 shadow-sm z-10">
                          <input
                            type="radio"
                            name="metodoPago"
                            checked={metodoPago === 'CAJA'}
                            onChange={() => setMetodoPago('CAJA')}
                            className="h-4.5 w-4.5 accent-brand-azul cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-black text-gray-900 text-base">
                            Pagar en Local (Caja)
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Asegura tu cupo en línea y realiza el pago con
                            efectivo o tarjeta al ingresar.
                          </p>
                        </div>
                        <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider text-brand-azul bg-brand-azul/10 px-2.5 py-1 rounded-lg w-fit">
                          Pago presencial
                        </span>
                      </div>
                    </button>
                  </div>

                  {metodoPago === 'YAPE' && (
                    <div className="p-5 bg-[#6E2FEC]/5 border border-[#6E2FEC]/20 rounded-3xl space-y-4 shadow-sm animate-fade-in">
                      <p className="text-sm font-black text-purple-950 uppercase tracking-wider">
                        Instrucciones de Pago:
                      </p>
                      <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside leading-relaxed font-medium">
                        <li>Abre Yape en tu teléfono móvil.</li>
                        <li>
                          Busca el número oficial del local (o escanea el QR en
                          recepción).
                        </li>
                        <li>
                          Envía exactamente{' '}
                          <strong className="text-[#6E2FEC] font-extrabold text-sm">
                            <PrecioLabel
                              tipoDia={getTarifaKey(
                                fechaSeleccionada!,
                                dispSeleccionada!.esFeriado
                              )}
                              precioMap={precioMap}
                            />
                          </strong>
                        </li>
                        <li>
                          Escribe el nombre del niño en el concepto del yapeo.
                        </li>
                        <li>
                          Sube la captura de pantalla del comprobante de pago
                          aquí abajo.
                        </li>
                      </ol>

                      <div className="space-y-1.5 pt-2 border-t border-purple-100">
                        <p className="text-xs font-bold text-gray-700">
                          Comprobante de Pago Yape{' '}
                          <span className="text-red-500">*</span>
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-[#6E2FEC]/10 file:text-[#6E2FEC] hover:file:bg-[#6E2FEC]/20 cursor-pointer"
                          onChange={(e) =>
                            setComprobante(e.target.files?.[0] ?? null)
                          }
                        />
                        {intentoEnvio && !comprobante && (
                          <p className="flex items-center gap-1 text-xs text-red-650 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Debes subir la captura del comprobante Yape
                          </p>
                        )}
                        {comprobante && (
                          <p className="flex items-center gap-1 text-xs text-green-700 mt-1">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            {comprobante.name} &middot;{' '}
                            {(comprobante.size / 1024).toFixed(0)} KB
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-gray-700">
                          Código de Operación Yape (opcional)
                        </p>
                        <Input
                          placeholder="Ej: 123456789"
                          value={codigoYape}
                          onChange={(e) => setCodigoYape(e.target.value)}
                          className="h-10 rounded-xl font-mono focus:border-[#6E2FEC]"
                        />
                      </div>
                    </div>
                  )}

                  {metodoPago === 'CAJA' && (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3 shadow-sm animate-fade-in">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        <strong className="font-bold">Importante:</strong> El
                        cupo quedará reservado temporalmente, pero el ingreso
                        final al local solo se confirmará al efectuar el pago
                        correspondiente en caja. Te aconsejamos llegar 10
                        minutos antes de tu hora planeada.
                      </p>
                    </div>
                  )}

                  {intentoEnvio && !metodoPago && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1 justify-center">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Selecciona un método de pago para continuar
                    </p>
                  )}
                </div>

                <button
                  onClick={confirmarReserva}
                  disabled={crear.isPending}
                  className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-pink-100 mt-6"
                >
                  {crear.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando reserva...
                    </>
                  ) : (
                    <>
                      <Ticket className="h-4 w-4" />
                      Confirmar y Finalizar Reserva
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Persistent Desktop Sidebar */}
          {paso < 4 && (
            <div className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-28 animate-fade-in">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-55 pb-3 uppercase tracking-wider">
                Resumen de Reserva
              </h3>

              {fechaSeleccionada ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Fecha Seleccionada
                    </p>
                    <p className="font-bold text-gray-800 capitalize text-sm">
                      {format(
                        parseISO(fechaSeleccionada),
                        "EEEE d 'de' MMMM yyyy",
                        { locale: es }
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Sede Principal &middot; Horario de atención:{' '}
                      {horaApertura} - {horaCierre}
                    </p>
                  </div>

                  {dispSeleccionada && (
                    <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <span className="text-xs text-gray-650 font-bold">
                        Valor Entrada
                      </span>
                      <PrecioLabel
                        tipoDia={getTarifaKey(
                          fechaSeleccionada,
                          dispSeleccionada.esFeriado
                        )}
                        precioMap={precioMap}
                      />
                    </div>
                  )}

                  {/* Form fields review */}
                  {(watchedValues.nombreNino ||
                    watchedValues.nombreAcompanante) && (
                    <div className="space-y-2.5 pt-3.5 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Datos Registrados
                      </p>
                      {watchedValues.nombreNino && (
                        <div className="text-xs text-gray-750 font-semibold">
                          <span className="text-gray-400 font-medium">
                            Niño:
                          </span>{' '}
                          <strong className="text-gray-800">
                            {watchedValues.nombreNino}
                          </strong>
                          {watchedValues.edadNino !== undefined &&
                            !isNaN(Number(watchedValues.edadNino)) && (
                              <span className="text-gray-400">
                                {' '}
                                ({watchedValues.edadNino} años)
                              </span>
                            )}
                        </div>
                      )}
                      {watchedValues.nombreAcompanante && (
                        <div className="text-xs text-gray-755 font-semibold">
                          <span className="text-gray-400 font-medium">
                            Acompañante:
                          </span>{' '}
                          <strong className="text-gray-800">
                            {watchedValues.nombreAcompanante}
                          </strong>
                          {watchedValues.dniAcompanante && (
                            <span className="text-gray-400 font-mono text-[11px]">
                              {' '}
                              (DNI: {watchedValues.dniAcompanante})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment method review */}
                  {metodoPago && (
                    <div className="space-y-2 pt-3.5 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Método de Pago
                      </p>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                        {metodoPago === 'YAPE' ? (
                          <>
                            <div className="w-6 h-6 bg-[#6E2FEC] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-white font-bold text-[10px]">
                                Y
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-800">
                              Yape
                            </span>
                          </>
                        ) : (
                          <>
                            <Banknote className="h-4.5 w-4.5 text-brand-azul shrink-0" />
                            <span className="text-xs font-bold text-gray-800">
                              Pago en Local
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">
                        Total a pagar
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Impuestos incluidos
                      </p>
                    </div>
                    <div className="text-right">
                      <PrecioLabel
                        tipoDia={getTarifaKey(
                          fechaSeleccionada!,
                          dispSeleccionada!.esFeriado
                        )}
                        precioMap={precioMap}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2.5">
                  <Ticket className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400 font-bold leading-relaxed">
                    Elige una fecha para ver el resumen en tiempo real de tu
                    reserva.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Sticky Bar/Bottom Sheet summary */}
        {paso > 1 && paso < 4 && fechaSeleccionada && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] p-4 z-50 rounded-t-3xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="max-w-[70%]">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">
                  Resumen de reserva
                </p>
                <p className="text-xs font-black text-gray-800 truncate mt-1 leading-none">
                  {watchedValues.nombreNino || 'Visitante'} &middot;{' '}
                  {format(parseISO(fechaSeleccionada), "d 'de' MMMM", {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] text-gray-400 leading-none">Total</p>
                <div className="mt-0.5 font-bold">
                  <PrecioLabel
                    tipoDia={getTarifaKey(
                      fechaSeleccionada!,
                      dispSeleccionada!.esFeriado
                    )}
                    precioMap={precioMap}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
