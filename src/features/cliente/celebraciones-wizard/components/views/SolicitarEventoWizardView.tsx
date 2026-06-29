'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { addDays, format } from 'date-fns'
import {
  Users,
  Loader2,
  ChevronRight,
  CalendarDays,
  Phone,
  MessageCircle,
  Check,
  CheckCircle2,
  Info,
  Calculator,
  PartyPopper,
  Clock,
  Cake,
  Baby,
  Gift,
  GraduationCap,
  Briefcase,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { useSolicitarEventoWizard } from '../../hooks/useSolicitarEventoWizard'
import { useSedesPublicas } from '@/features/public/hooks/useSedesPublicas'
import { useWizardTimer } from '../../hooks/useWizardTimer'
import { usePaquetesPublico, useTiposEventoPublico } from '@/hooks/useComercial'
import {
  useExtrasPaquete,
  useTurnos,
  useServiciosCotizacion,
} from '@/hooks/useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn, formatDate, formatCurrency } from '@/lib/utils'

import { WizardHeader } from '../ui/WizardHeader'
import { PaqueteCard } from '../ui/PaqueteCard'
import { PaqueteDetalleModal } from '../ui/PaqueteDetalleModal'
import { ResumenEnVivo } from '../ui/ResumenEnVivo'
import { ResumenMovilExpandible } from '../ui/ResumenMovilExpandible'
import { ModalAnticipacionEvento } from '../ui/ModalAnticipacionEvento'
import { WizardWhatsAppButton } from '../ui/WizardWhatsAppButton'
import { SuccessWizardView } from './SuccessWizardView'
import { Camino } from '../../../shared/types'

const WIZARD_DURATION = 600

// ─── Icons ────────────────────────────────────────────────────────────────

function renderIconoTipoEvento(
  iconoName: string | undefined,
  className?: string
) {
  const cnStr = className || 'h-4 w-4'
  switch (iconoName) {
    case 'cake':
      return <Cake className={cnStr} />
    case 'baby':
      return <Baby className={cnStr} />
    case 'gift':
      return <Gift className={cnStr} />
    case 'graduation-cap':
      return <GraduationCap className={cnStr} />
    case 'briefcase':
      return <Briefcase className={cnStr} />
    case 'sparkles':
      return <Sparkles className={cnStr} />
    case 'party-popper':
      return <PartyPopper className={cnStr} />
    default:
      return <PartyPopper className={cnStr} />
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────

function LoginGuard() {
  return (
    <div className="flex flex-col items-center text-center py-20 space-y-5 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-rosa/10 flex items-center justify-center">
        <PartyPopper className="h-8 w-8 text-brand-rosa" />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900">
          Inicia sesión para continuar
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Necesitas una cuenta para solicitar tu evento privado.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button
          asChild
          className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full"
        >
          <Link href="/auth/login?callbackUrl=/cliente/celebraciones/solicitar">
            Iniciar sesión
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/auth/registro?callbackUrl=/cliente/celebraciones/solicitar">
            Crear cuenta
          </Link>
        </Button>
      </div>
    </div>
  )
}

function FilaResumen({
  label,
  valor,
}: {
  label: string
  valor: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{valor}</span>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1"
      role="alert"
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

function FieldWarning({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mt-1">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

// ─── Timer Expired Modal ──────────────────────────────────────────────────

function TimerExpiredBanner({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-20 space-y-5 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
        <Clock className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900">
          Tu sesión ha expirado
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          El tiempo de 10 minutos para completar la solicitud ha concluido.
          Puedes comenzar de nuevo.
        </p>
      </div>
      <Button
        onClick={onRestart}
        className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full px-8"
      >
        Comenzar de nuevo
      </Button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export function SolicitarEventoWizardView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { idUsuario, clientePerfilId, isAuthenticated } = useAuth()
  const { idSedeUnica, isLoading: sedesLoading } = useSedesPublicas()
  const idSede = idSedeUnica ?? 0

  const { data: configPublica } = useConfiguracionCalendarioPublica(idSede)
  const edadMin = configPublica?.edadMinCumple ?? 0
  const edadMax = configPublica?.edadMaxCumple ?? 17
  const anticipacionMin = configPublica?.diasMinEventoPrivado ?? 15
  const rangoDias = configPublica?.diasMaxEventoPrivado ?? 90

  const fechaMin = useMemo(
    () => format(addDays(new Date(), anticipacionMin), 'yyyy-MM-dd'),
    [anticipacionMin]
  )
  const fechaMax = useMemo(
    () => format(addDays(new Date(), rangoDias), 'yyyy-MM-dd'),
    [rangoDias]
  )

  const wizard = useSolicitarEventoWizard(
    clientePerfilId ?? idUsuario,
    idSede,
    isAuthenticated,
    edadMin,
    edadMax
  )
  const {
    paso,
    setPaso,
    modalAnticipacion,
    setModalAnticipacion,
    tipoEvento,
    setTipoEvento,
    camino,
    setCamino,
    idPaquete,
    setIdPaquete,
    paqueteDetalle,
    setPaqueteDetalle,
    extrasSeleccionados,
    toggleExtra,
    otrasIdeas,
    setOtrasIdeas,
    descripcion,
    setDescripcion,
    serviciosCotizacion,
    toggleServicio,
    presupuestoCliente,
    setPresupuestoCliente,
    fechaSel,
    setFecha,
    idTurno,
    setIdTurno,
    nombreNino,
    setNombreNino,
    edadCumple,
    setEdadCumple,
    invitados,
    setInvitados,
    telefonoAdicional,
    setTelefonoAdicional,
    eventoCreado,
    solicitar,
    isSubmitting,
    canAdvance1,
    canAdvance2,
    canAdvance3,
    validationErrors,
    resetWizard,
  } = wizard

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('paso', String(paso))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [paso])

  // ─── Timer ──────────────────────────────────────────────────────────────

  const [timerExpired, setTimerExpired] = useState(false)
  const [aceptaLegal, setAceptaLegal] = useState(false)
  const prevPasoRef = useRef<1 | 2 | 3 | 4>(1)

  const {
    secondsLeft,
    progress: timerProgress,
    phase: timerPhase,
    displayTime: timerDisplay,
    restart: restartTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useWizardTimer({
    durationSeconds: WIZARD_DURATION,
    sessionKey: 'evento_wizard_timer',
    startPaused: true,
    onExpire: () => setTimerExpired(true),
  })

  useEffect(() => {
    const prev = prevPasoRef.current
    prevPasoRef.current = paso

    if (paso === 2 && prev === 1) {
      restartTimer()
    } else if (paso === 1) {
      pauseTimer()
    } else {
      resumeTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  useEffect(() => {
    if (paqueteDetalle) pauseTimer()
    else if (paso > 1) resumeTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqueteDetalle])

  useEffect(() => {
    if (secondsLeft === 180) {
      toast.warning('Te quedan 3 minutos para completar tu solicitud', {
        duration: 8000,
      })
    }
    if (secondsLeft === 60) {
      toast.error('Solo queda 1 minuto. Completa tu solicitud pronto.', {
        duration: 15000,
      })
    }
  }, [secondsLeft])

  // ─── Data ────────────────────────────────────────────────────────────────

  const { data: paquetesAll = [], isLoading: isLoadingPaquetes } =
    usePaquetesPublico()
  const { data: tiposEvento = [], isLoading: isLoadingTipos } =
    useTiposEventoPublico()
  const { data: extras = [] } = useExtrasPaquete(idPaquete)
  const {
    data: turnos = [],
    isError: isTurnosError,
    isLoading: isTurnosLoading,
  } = useTurnos(idSede)
  const { data: servicios = [] } = useServiciosCotizacion()
  const { data: disponibilidades } = useDisponibilidadRango(
    idSede,
    fechaMin,
    fechaMax
  )

  const tipoEventoSeleccionado = useMemo(
    () => tiposEvento.find((t) => t.codigo === tipoEvento) ?? null,
    [tiposEvento, tipoEvento]
  )
  const tipoEventoLabel = tipoEventoSeleccionado
    ? tipoEventoSeleccionado.nombre
    : null

  // Filter packages by selected event type (always show cotización option)
  const paquetesFiltrados = useMemo(() => {
    if (!tipoEvento) return paquetesAll
    return paquetesAll.filter(
      (p) => !p.tipoEventoCodigo || p.tipoEventoCodigo === tipoEvento
    )
  }, [paquetesAll, tipoEvento])

  const disponibilidadDia = useMemo(
    () => disponibilidades?.find((d) => d.fecha === fechaSel),
    [disponibilidades, fechaSel]
  )

  const fechasOcupadas = useMemo(() => {
    if (!disponibilidades) return new Set<string>()
    return new Set(
      disponibilidades.filter((d) => !d.disponiblePrivado).map((d) => d.fecha)
    )
  }, [disponibilidades])

  const paqueteSeleccionado =
    paquetesAll.find((p) => p.id === idPaquete) ?? null
  const turnoSeleccionado = turnos.find((t) => t.id === idTurno) ?? null

  // Estimated budget from selected services (cotización path)
  const presupuestoEstimado = useMemo(
    () =>
      servicios
        .filter((s) => serviciosCotizacion.includes(s.id))
        .reduce((sum, s) => sum + s.precioReferencial, 0),
    [serviciosCotizacion, servicios]
  )

  useEffect(() => {
    if (
      tipoEvento &&
      !isLoadingPaquetes &&
      paquetesFiltrados.length === 0 &&
      camino !== 'cotizacion'
    ) {
      setCamino('cotizacion')
      setIdPaquete(null)
    }
  }, [tipoEvento, paquetesFiltrados.length, isLoadingPaquetes])

  const limitePersonas = paqueteSeleccionado?.limitepersonas ?? null
  const invitadosExcedeLimite =
    limitePersonas && invitados && invitados > limitePersonas

  // ─── Date selection ──────────────────────────────────────────────────────

  function intentarSeleccionarFecha(valor: string) {
    if (!valor) {
      setFecha(null)
      setIdTurno(null)
      return
    }
    const dias = Math.floor(
      (new Date(valor).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
    )
    if (dias < anticipacionMin) {
      setModalAnticipacion(true)
      return
    }
    setFecha(valor)
    setIdTurno(null)
  }

  // ─── Guard states ─────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoginGuard />
      </div>
    )
  }

  if (sedesLoading) return null

  if (timerExpired && !eventoCreado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <TimerExpiredBanner
          onRestart={() => {
            resetWizard()
            setTimerExpired(false)
            restartTimer()
          }}
        />
      </div>
    )
  }

  if (eventoCreado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <SuccessWizardView evento={eventoCreado} />
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <WizardHeader
        titulo="Solicitar evento"
        paso={paso}
        total={4}
        onSalir={() => router.push('/celebraciones')}
        secondsLeft={secondsLeft}
        timerProgress={timerProgress}
        timerPhase={timerPhase}
        timerDisplay={timerDisplay}
      />

      {timerPhase === 'critical' && (
        <div className="bg-red-600 text-white text-xs text-center py-1.5 px-4 font-semibold animate-pulse">
          Tu sesión expira en {timerDisplay} — completa la solicitud pronto
        </div>
      )}

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={cn(
              'space-y-6',
              paso === 4 ? 'lg:col-span-3' : 'lg:col-span-2'
            )}
          >
            {/* ─── PASO 1 ──────────────────────────────────────────────── */}
            {paso === 1 && (
              <div className="space-y-6 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 1 de 4
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                    ¿Qué celebramos?
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Elige el tipo de evento para ver las opciones disponibles.
                  </p>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 mt-4">
                    {isLoadingTipos ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-11 bg-gray-100 rounded-xl animate-pulse"
                        />
                      ))
                    ) : tiposEvento.length === 0 ? (
                      <p className="text-sm text-gray-400 col-span-2">
                        No hay tipos de eventos disponibles en este momento.
                      </p>
                    ) : (
                      tiposEvento.map((t) => (
                        <button
                          key={t.codigo}
                          type="button"
                          onClick={() => {
                            setTipoEvento(t.codigo)
                            setCamino(null)
                            setIdPaquete(null)
                          }}
                          className={cn(
                            'px-4 py-3 sm:py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-2 justify-center sm:justify-start min-h-[44px]',
                            tipoEvento === t.codigo
                              ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                              : 'border-gray-200 text-gray-600 hover:border-brand-rosa/40 bg-white'
                          )}
                        >
                          {renderIconoTipoEvento(t.icono, 'h-4 w-4 shrink-0')}
                          <span className="leading-tight">{t.nombre}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {tipoEvento && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        ¿Cómo quieres organizarlo?
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Elige un paquete o pídenos una cotización a tu medida.
                      </p>
                    </div>

                    {isLoadingPaquetes ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-56 bg-gray-100 rounded-2xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        {paquetesFiltrados.length === 0 && (
                          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 leading-relaxed">
                              No hay paquetes prediseñados para este tipo de
                              evento. Hemos seleccionado la cotización
                              personalizada para ti.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {paquetesFiltrados.map((paq) => (
                            <PaqueteCard
                              key={paq.id}
                              paquete={paq}
                              seleccionado={
                                idPaquete === paq.id && camino === 'paquete'
                              }
                              onSeleccionar={() => {
                                setCamino('paquete')
                                setIdPaquete(paq.id)
                              }}
                              onVerDetalle={() => setPaqueteDetalle(paq)}
                            />
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              setCamino('cotizacion')
                              setIdPaquete(null)
                            }}
                            className={cn(
                              'p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 bg-white min-h-[160px] sm:min-h-0',
                              camino === 'cotizacion'
                                ? 'border-brand-azul bg-brand-azul/5 ring-2 ring-brand-azul/20'
                                : 'border-dashed border-gray-300 hover:border-brand-azul/40'
                            )}
                          >
                            <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
                              <MessageCircle className="h-5 w-5 text-brand-azul" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-gray-900">
                                Cotización personalizada
                              </p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Cuéntanos qué imaginas y te armamos una
                                propuesta a medida.
                              </p>
                            </div>
                            {camino === 'cotizacion' && (
                              <div className="flex items-center gap-1.5 text-xs text-brand-azul font-semibold">
                                <Check className="h-3.5 w-3.5" />
                                Seleccionada
                              </div>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {!tipoEvento && (
                    <p className="text-xs text-gray-400 text-center">
                      Elige un tipo de evento para continuar
                    </p>
                  )}
                  {tipoEvento && !camino && (
                    <p className="text-xs text-gray-400 text-center">
                      Elige un paquete o la cotización personalizada para
                      continuar
                    </p>
                  )}
                  <Button
                    className="w-full bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-40 text-white rounded-xl gap-2 h-12"
                    disabled={!canAdvance1}
                    onClick={() => setPaso(2)}
                  >
                    Continuar <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── PASO 2 — Paquete ────────────────────────────────────── */}
            {paso === 2 && camino === 'paquete' && (
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 2 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">
                    Personaliza tu paquete
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega lo que quieras incluir. El precio final lo confirma
                    el equipo.
                  </p>
                </div>

                {paqueteSeleccionado && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      {paqueteSeleccionado.color && (
                        <div
                          className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: paqueteSeleccionado.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">
                          {paqueteSeleccionado.nombre}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {paqueteSeleccionado.descripcionCorta}
                        </p>
                        {paqueteSeleccionado.limitepersonas && (
                          <p className="text-xs text-amber-600 font-medium mt-1">
                            Capacidad máxima:{' '}
                            {paqueteSeleccionado.limitepersonas} personas
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 leading-none">
                          desde
                        </p>
                        <p className="font-black text-gray-900 text-base leading-tight">
                          {formatCurrency(paqueteSeleccionado.precio)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      className="mt-3 text-xs text-brand-azul font-semibold hover:underline"
                    >
                      Cambiar paquete
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    El precio final incluirá los extras que elijas. Te
                    contactaremos en <strong>24–48 horas</strong> con la
                    cotización completa.
                  </p>
                </div>

                {extras.length > 0 && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-semibold">
                        Extras disponibles
                      </Label>
                      <p className="text-xs text-gray-400 mt-0.5">
                        El precio de cada extra se confirmará en la cotización.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {extras.map((ex) => {
                        const marcado = extrasSeleccionados.includes(ex.id)
                        return (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => toggleExtra(ex.id)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                              marcado
                                ? 'border-brand-rosa bg-brand-rosa/5'
                                : 'border-gray-200 hover:border-brand-rosa/30 bg-white'
                            )}
                          >
                            <div
                              className={cn(
                                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                                marcado
                                  ? 'bg-brand-rosa border-brand-rosa'
                                  : 'border-gray-300'
                              )}
                            >
                              {marcado && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {ex.nombre}
                              </p>
                              {ex.descripcion && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {ex.descripcion}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                              A cotizar
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    ¿Algo más en mente?{' '}
                    <span className="text-gray-400 font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <textarea
                    value={otrasIdeas}
                    onChange={(e) => setOtrasIdeas(e.target.value)}
                    placeholder="Cuéntanos cualquier idea adicional para tu evento"
                    rows={3}
                    maxLength={500}
                    className={cn(
                      'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white min-h-[80px]',
                      validationErrors.otrasIdeas
                        ? 'border-red-400'
                        : 'border-gray-200'
                    )}
                  />
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <FieldError message={validationErrors.otrasIdeas} />
                    <span
                      className={cn(
                        'text-gray-400 shrink-0 ml-auto',
                        otrasIdeas.length > 450 &&
                          'text-amber-600 font-semibold'
                      )}
                    >
                      {otrasIdeas.length}/500
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="presupuesto-paq"
                    className="text-sm font-semibold"
                  >
                    ¿Cuál es tu presupuesto aproximado?{' '}
                    <span className="text-gray-400 font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <p className="text-xs text-gray-400">
                    Nos ayuda a preparar una propuesta ajustada a tus
                    posibilidades.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
                      S/
                    </span>
                    <Input
                      id="presupuesto-paq"
                      type="number"
                      placeholder="Ej: 1500"
                      min={1}
                      max={50000}
                      value={presupuestoCliente ?? ''}
                      onChange={(e) =>
                        setPresupuestoCliente(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className={cn(
                        'h-11 rounded-xl pl-9',
                        validationErrors.presupuestoCliente && 'border-red-400'
                      )}
                    />
                  </div>
                  <FieldError message={validationErrors.presupuestoCliente} />
                </div>

                <div className="space-y-2 pt-1">
                  {!canAdvance2 && Object.keys(validationErrors).length > 0 && (
                    <p className="text-xs text-red-500 text-center">
                      Corrige los errores para continuar
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12"
                      onClick={() => setPaso(1)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-40 text-white rounded-xl gap-2 h-12"
                      disabled={!canAdvance2}
                      onClick={() => setPaso(3)}
                    >
                      Continuar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── PASO 2 — Cotización ─────────────────────────────────── */}
            {paso === 2 && camino === 'cotizacion' && (
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 2 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">
                    Cuéntanos tu idea
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mientras más nos cuentes, mejor será la propuesta que te
                    preparemos.
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Prepararemos una propuesta personalizada y te contactaremos
                    en <strong>24–48 horas</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Describe tu evento{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Cuéntanos qué tipo de celebración imaginas, la temática, el ambiente que buscas..."
                    rows={4}
                    maxLength={1000}
                    className={cn(
                      'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white min-h-[80px] sm:min-h-[100px]',
                      validationErrors.descripcion
                        ? 'border-red-400'
                        : 'border-gray-200'
                    )}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                    <FieldError message={validationErrors.descripcion} />
                    {!validationErrors.descripcion &&
                      descripcion.length >= 30 && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Descripción completa
                        </span>
                      )}
                    <span
                      className={cn(
                        'text-gray-400 ml-auto shrink-0',
                        descripcion.length > 950 &&
                          'text-amber-600 font-semibold'
                      )}
                    >
                      {descripcion.length}/1000
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    ¿Qué servicios te gustaría incluir?
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicios.map((servicio) => {
                      const activo = serviciosCotizacion.includes(servicio.id)
                      return (
                        <button
                          key={servicio.id}
                          type="button"
                          onClick={() => toggleServicio(servicio.id)}
                          className={cn(
                            'flex items-center justify-between gap-2 p-3 rounded-xl border-2 text-left transition-all bg-white',
                            activo
                              ? 'border-brand-azul bg-brand-azul/5'
                              : 'border-gray-200 hover:border-brand-azul/30'
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {servicio.nombre}
                            </p>
                            {servicio.descripcion && (
                              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                                {servicio.descripcion}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              {servicio.precioReferencial
                                ? `desde ${formatCurrency(servicio.precioReferencial)}`
                                : 'A consultar'}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                              activo
                                ? 'bg-brand-azul border-brand-azul'
                                : 'border-gray-300'
                            )}
                          >
                            {activo && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {presupuestoEstimado > 0 && (
                  <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Presupuesto estimado (servicios)
                        </p>
                        <p className="text-2xl font-black text-brand-azul mt-1">
                          {formatCurrency(presupuestoEstimado)}
                        </p>
                      </div>
                      <Calculator className="h-8 w-8 text-brand-azul/40" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Estimado orientativo. El precio final lo confirma el
                      equipo tras revisar tu solicitud.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="presupuesto-coti"
                    className="text-sm font-semibold"
                  >
                    ¿Cuál es tu presupuesto aproximado?{' '}
                    <span className="text-gray-400 font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <p className="text-xs text-gray-400">
                    Nos ayuda a preparar una propuesta ajustada a tus
                    posibilidades.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
                      S/
                    </span>
                    <Input
                      id="presupuesto-coti"
                      type="number"
                      placeholder="Ej: 1500"
                      min={1}
                      max={50000}
                      value={presupuestoCliente ?? ''}
                      onChange={(e) =>
                        setPresupuestoCliente(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className={cn(
                        'h-11 rounded-xl pl-9',
                        validationErrors.presupuestoCliente && 'border-red-400'
                      )}
                    />
                  </div>
                  <FieldError message={validationErrors.presupuestoCliente} />
                </div>

                <div className="space-y-2 pt-1">
                  {!canAdvance2 && descripcion.length < 30 && (
                    <p className="text-xs text-gray-500 text-center">
                      Escribe al menos 30 caracteres para continuar
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12"
                      onClick={() => setPaso(1)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-40 text-white rounded-xl gap-2 h-12"
                      disabled={!canAdvance2}
                      onClick={() => setPaso(3)}
                    >
                      Continuar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── PASO 3 — Fecha y detalles ───────────────────────────── */}
            {paso === 3 && (
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 3 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">
                    Fecha y detalles
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Elige cuándo quieres tu evento.
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="fecha" className="text-sm font-semibold">
                    Fecha del evento <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-gray-400">
                    La reserva debe realizarse con al menos {anticipacionMin}{' '}
                    días de anticipación.
                  </p>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fecha"
                      type="date"
                      min={fechaMin}
                      max={fechaMax}
                      value={fechaSel ?? ''}
                      onChange={(e) => intentarSeleccionarFecha(e.target.value)}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                  {fechaSel && fechasOcupadas.has(fechaSel) && (
                    <FieldError message="Fecha no disponible. Por favor selecciona otra fecha." />
                  )}
                </div>

                {/* Turnos */}
                {fechaSel && !fechasOcupadas.has(fechaSel) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Turno preferido{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    {isTurnosError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800">
                          No se pudieron cargar los turnos disponibles. Por
                          favor recarga la página.
                        </p>
                      </div>
                    )}
                    {isTurnosLoading && (
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            className="h-16 bg-gray-100 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {!isTurnosError &&
                      !isTurnosLoading &&
                      turnos.length === 0 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">
                            No hay turnos configurados para esta sede.
                          </p>
                        </div>
                      )}
                    <div className="grid grid-cols-2 gap-2">
                      {turnos.map((turno) => {
                        const DISPONIBILIDAD_POR_CODIGO: Record<
                          string,
                          boolean | undefined
                        > = {
                          T1: disponibilidadDia?.turnoT1Disponible,
                          T2: disponibilidadDia?.turnoT2Disponible,
                        }
                        const disponible =
                          DISPONIBILIDAD_POR_CODIGO[turno.codigo] ?? true
                        const seleccionado = idTurno === turno.id
                        return (
                          <button
                            key={turno.id}
                            type="button"
                            disabled={!disponible}
                            onClick={() => disponible && setIdTurno(turno.id)}
                            className={cn(
                              'border rounded-xl p-3.5 text-left transition-all bg-white',
                              !disponible
                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                : seleccionado
                                  ? 'border-brand-rosa bg-brand-rosa/5 ring-1 ring-brand-rosa'
                                  : 'border-gray-200 hover:border-brand-rosa/40'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <p className="text-sm font-bold text-gray-900">
                                {turno.nombre}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {turno.horaInicio} – {turno.horaFin}
                            </p>
                            {!disponible && (
                              <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                                No disponible
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Birthday fields */}
                {tipoEvento === 'CUMPLEANOS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="nombreNino"
                        className="text-sm font-semibold"
                      >
                        Nombre del cumpleañero/a{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombreNino"
                        placeholder="Ej: María José"
                        value={nombreNino}
                        onChange={(e) => setNombreNino(e.target.value)}
                        className={cn(
                          'h-11 rounded-xl',
                          validationErrors.nombreNino && 'border-red-400'
                        )}
                        maxLength={60}
                      />
                      <FieldError message={validationErrors.nombreNino} />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="edadCumple"
                        className="text-sm font-semibold"
                      >
                        Edad que cumple
                      </Label>
                      <Input
                        id="edadCumple"
                        type="number"
                        placeholder="5"
                        min={edadMin}
                        max={edadMax}
                        value={edadCumple ?? ''}
                        onChange={(e) =>
                          setEdadCumple(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className={cn(
                          'h-11 rounded-xl',
                          validationErrors.edadCumple && 'border-red-400'
                        )}
                      />
                      <FieldError message={validationErrors.edadCumple} />
                      {edadCumple !== null &&
                        edadCumple >= Math.max(10, edadMax - 5) &&
                        !validationErrors.edadCumple && (
                          <FieldWarning message="Este paquete está pensado para niños. ¿Es correcto?" />
                        )}
                    </div>
                  </div>
                )}

                {/* Guests (both paths, required) */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="invitados-paso3"
                    className="text-sm font-semibold"
                  >
                    Número aproximado de invitados{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="invitados-paso3"
                      type="number"
                      placeholder="20"
                      min={1}
                      max={500}
                      value={invitados ?? ''}
                      onChange={(e) =>
                        setInvitados(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className={cn(
                        'h-11 rounded-xl pl-9',
                        validationErrors.invitados && 'border-red-400'
                      )}
                    />
                  </div>
                  <FieldError message={validationErrors.invitados} />
                  {invitadosExcedeLimite && !validationErrors.invitados && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        El paquete seleccionado tiene un límite de{' '}
                        {limitePersonas} personas. Si tienes más invitados,
                        considera solicitar una cotización personalizada.
                      </p>
                    </div>
                  )}
                  {camino === 'cotizacion' &&
                    invitados !== null &&
                    invitados > 500 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          Es un número grande de invitados. El equipo evaluará
                          la disponibilidad y te lo confirmará en la cotización.
                        </p>
                      </div>
                    )}
                </div>

                {/* Additional phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="telefono" className="text-sm font-semibold">
                    Teléfono de contacto adicional{' '}
                    <span className="text-gray-400 font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telefono"
                      placeholder="987654321"
                      value={telefonoAdicional}
                      onChange={(e) => setTelefonoAdicional(e.target.value)}
                      className={cn(
                        'h-11 rounded-xl pl-9',
                        validationErrors.telefonoAdicional && 'border-red-400'
                      )}
                      maxLength={15}
                    />
                  </div>
                  <FieldError message={validationErrors.telefonoAdicional} />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setPaso(2)}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2"
                    disabled={!canAdvance3}
                    onClick={() => setPaso(4)}
                  >
                    Ver resumen <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── PASO 4 — Resumen ────────────────────────────────────── */}
            {paso === 4 && (
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 lg:max-w-2xl lg:mx-auto">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 4 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">
                    Revisa tu solicitud
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirma los datos antes de enviar. Te contactaremos en
                    menos de 24 horas.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                  {tipoEventoLabel && (
                    <FilaResumen
                      label="Tipo de celebración"
                      valor={tipoEventoLabel}
                    />
                  )}
                  {camino === 'paquete' && paqueteSeleccionado && (
                    <FilaResumen
                      label="Paquete"
                      valor={`${paqueteSeleccionado.nombre} · ${formatCurrency(paqueteSeleccionado.precio)}`}
                    />
                  )}
                  {camino === 'paquete' && extrasSeleccionados.length > 0 && (
                    <FilaResumen
                      label="Extras"
                      valor={extrasSeleccionados
                        .map((id) => extras.find((e) => e.id === id)?.nombre)
                        .filter(Boolean)
                        .join(', ')}
                    />
                  )}
                  {camino === 'cotizacion' && (
                    <>
                      <FilaResumen
                        label="Modalidad"
                        valor="Cotización personalizada"
                      />
                      {serviciosCotizacion.length > 0 && (
                        <FilaResumen
                          label="Servicios"
                          valor={serviciosCotizacion
                            .map(
                              (id) => servicios.find((s) => s.id === id)?.nombre
                            )
                            .filter(Boolean)
                            .join(', ')}
                        />
                      )}
                      {presupuestoEstimado > 0 && (
                        <FilaResumen
                          label="Estimado servicios"
                          valor={
                            <span className="text-brand-azul font-bold">
                              {formatCurrency(presupuestoEstimado)}
                            </span>
                          }
                        />
                      )}
                    </>
                  )}
                  <FilaResumen
                    label="Fecha"
                    valor={fechaSel ? formatDate(fechaSel) : '—'}
                  />
                  <FilaResumen
                    label="Turno"
                    valor={
                      turnoSeleccionado
                        ? `${turnoSeleccionado.nombre} · ${turnoSeleccionado.horaInicio}–${turnoSeleccionado.horaFin}`
                        : '—'
                    }
                  />
                  {tipoEvento === 'CUMPLEANOS' && nombreNino && (
                    <FilaResumen
                      label="Cumpleañero/a"
                      valor={`${nombreNino}${edadCumple !== null ? ` · ${edadCumple} años` : ''}`}
                    />
                  )}
                  {invitados && (
                    <FilaResumen
                      label="Invitados"
                      valor={`~${invitados} personas`}
                    />
                  )}
                  {presupuestoCliente && presupuestoCliente > 0 && (
                    <FilaResumen
                      label="Tu presupuesto"
                      valor={
                        <span className="text-green-700 font-bold">
                          {formatCurrency(presupuestoCliente)}
                        </span>
                      }
                    />
                  )}
                </div>

                {timerPhase !== 'safe' && (
                  <div
                    className={cn(
                      'flex items-start gap-2 p-3 rounded-xl border',
                      timerPhase === 'critical'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-amber-50 border-amber-200'
                    )}
                  >
                    <Clock
                      className={cn(
                        'h-4 w-4 shrink-0 mt-0.5',
                        timerPhase === 'critical'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      )}
                    />
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        timerPhase === 'critical'
                          ? 'text-red-800'
                          : 'text-amber-800'
                      )}
                    >
                      Tu sesión expira en {timerDisplay}. Envía tu solicitud
                      antes de que se cancele.
                    </p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800">
                    El precio final será confirmado por el equipo según los
                    detalles de tu solicitud.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={aceptaLegal}
                    onCheckedChange={(v) => setAceptaLegal(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-gray-700 leading-relaxed">
                    He leído y acepto los{' '}
                    <Link
                      href="/legal/terminos"
                      target="_blank"
                      className="text-brand-azul underline font-semibold"
                    >
                      Términos y Condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link
                      href="/legal/privacidad"
                      target="_blank"
                      className="text-brand-azul underline font-semibold"
                    >
                      Política de Privacidad
                    </Link>
                    .
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setPaso(3)}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl font-black text-base gap-2 h-12"
                    disabled={isSubmitting || !aceptaLegal}
                    onClick={() => solicitar()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PartyPopper className="h-5 w-5" />
                        Enviar solicitud
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <div className={cn('hidden', paso !== 4 && 'lg:block')}>
            <ResumenEnVivo
              tipoEvento={tipoEvento}
              tipoEventoLabel={tipoEventoLabel}
              camino={camino}
              paquete={paqueteSeleccionado}
              extras={extras}
              extrasSeleccionados={extrasSeleccionados}
              serviciosCotizacion={serviciosCotizacion}
              servicios={servicios}
              presupuestoEstimado={presupuestoEstimado}
              presupuestoCliente={presupuestoCliente}
              fecha={fechaSel}
              turno={turnoSeleccionado}
              nombreNino={nombreNino}
              edadCumple={edadCumple}
              invitados={invitados}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky resume */}
      {paso !== 4 && (
        <ResumenMovilExpandible
          tipoEvento={tipoEvento}
          tipoEventoLabel={tipoEventoLabel}
          camino={camino}
          paquete={paqueteSeleccionado}
          extras={extras}
          extrasSeleccionados={extrasSeleccionados}
          serviciosCotizacion={serviciosCotizacion}
          servicios={servicios}
          presupuestoEstimado={presupuestoEstimado}
          presupuestoCliente={presupuestoCliente}
          fecha={fechaSel}
          turno={turnoSeleccionado}
        />
      )}

      {/* Package detail modal */}
      <PaqueteDetalleModal
        paquete={paqueteDetalle}
        open={!!paqueteDetalle}
        onClose={() => setPaqueteDetalle(null)}
        onElegir={(id) => {
          setCamino('paquete')
          setIdPaquete(id)
        }}
      />

      {/* Anticipation warning modal */}
      <ModalAnticipacionEvento
        open={modalAnticipacion}
        onClose={() => setModalAnticipacion(false)}
        diasMinimos={anticipacionMin}
      />

      {/* Floating WhatsApp button */}
      <WizardWhatsAppButton
        tipoEventoLabel={tipoEventoLabel}
        camino={camino}
        paquete={paqueteSeleccionado}
        fecha={fechaSel}
        turno={turnoSeleccionado}
        invitados={invitados}
        presupuestoCliente={presupuestoCliente}
      />
    </div>
  )
}
