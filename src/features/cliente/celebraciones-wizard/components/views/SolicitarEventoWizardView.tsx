'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Banknote,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { useSolicitarEventoWizard } from '../../hooks/useSolicitarEventoWizard'
import { useWizardTimer } from '../../hooks/useWizardTimer'
import { usePaquetesPublico, useTiposEventoPublico } from '@/hooks/useComercial'
import { useExtrasPaquete, useTurnos, useServiciosCotizacion } from '@/hooks/useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
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

const ANTICIPACION_MIN = 15
const RANGO_DIAS        = 90
const WIZARD_DURATION   = 600 // 10 minutes

// ─── Icons ────────────────────────────────────────────────────────────────

function renderIconoTipoEvento(iconoName: string | undefined, className?: string) {
  const cnStr = className || 'h-4 w-4'
  switch (iconoName) {
    case 'cake':           return <Cake className={cnStr} />
    case 'baby':           return <Baby className={cnStr} />
    case 'gift':           return <Gift className={cnStr} />
    case 'graduation-cap': return <GraduationCap className={cnStr} />
    case 'briefcase':      return <Briefcase className={cnStr} />
    case 'sparkles':       return <Sparkles className={cnStr} />
    case 'party-popper':   return <PartyPopper className={cnStr} />
    default:               return <PartyPopper className={cnStr} />
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function fechaMin() { return format(addDays(new Date(), ANTICIPACION_MIN), 'yyyy-MM-dd') }
function fechaMax() { return format(addDays(new Date(), RANGO_DIAS), 'yyyy-MM-dd') }

// ─── Sub-components ───────────────────────────────────────────────────────

function LoginGuard() {
  return (
    <div className="flex flex-col items-center text-center py-20 space-y-5 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-rosa/10 flex items-center justify-center">
        <PartyPopper className="h-8 w-8 text-brand-rosa" />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900">Inicia sesión para continuar</h2>
        <p className="text-sm text-gray-500 mt-1">
          Necesitas una cuenta para solicitar tu evento privado.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button asChild className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full">
          <Link href="/auth/login?callbackUrl=/celebraciones/solicitar">Iniciar sesión</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/auth/registro?callbackUrl=/celebraciones/solicitar">Crear cuenta</Link>
        </Button>
      </div>
    </div>
  )
}

function FilaResumen({ label, valor }: { label: string; valor: React.ReactNode }) {
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
    <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1" role="alert">
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
        <h2 className="text-xl font-black text-gray-900">Tu sesión ha expirado</h2>
        <p className="text-sm text-gray-500 mt-1">
          El tiempo de 10 minutos para completar la solicitud ha concluido. Puedes comenzar de nuevo.
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
  const { idSede: idSedeAuth, idUsuario, clientePerfilId, isAuthenticated } = useAuth()
  const idSede = idSedeAuth ?? 1

  const wizard = useSolicitarEventoWizard(clientePerfilId ?? idUsuario, idSede, isAuthenticated)
  const {
    paso, setPaso,
    modalAnticipacion, setModalAnticipacion,
    tipoEvento, setTipoEvento,
    camino, setCamino,
    idPaquete, setIdPaquete,
    paqueteDetalle, setPaqueteDetalle,
    extrasSeleccionados, toggleExtra,
    otrasIdeas, setOtrasIdeas,
    descripcion, setDescripcion,
    serviciosCotizacion, toggleServicio,
    presupuestoCliente, setPresupuestoCliente,
    fechaSel, setFecha,
    idTurno, setIdTurno,
    nombreNino, setNombreNino,
    edadCumple, setEdadCumple,
    invitados, setInvitados,
    telefonoAdicional, setTelefonoAdicional,
    eventoCreado,
    solicitar, isSubmitting,
    canAdvance1, canAdvance2, canAdvance3,
    validationErrors,
    resetWizard,
  } = wizard

  // ─── Timer ──────────────────────────────────────────────────────────────

  const [timerExpired, setTimerExpired] = useState(false)

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
    onExpire: () => setTimerExpired(true),
  })

  useEffect(() => {
    if (paqueteDetalle) pauseTimer()
    else resumeTimer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqueteDetalle])

  // Toast warnings at 3 min and 1 min
  useEffect(() => {
    if (secondsLeft === 180) {
      toast.warning('⏳ Te quedan 3 minutos para completar tu solicitud', { duration: 8000 })
    }
    if (secondsLeft === 60) {
      toast.error('🚨 ¡Solo queda 1 minuto! Completa tu solicitud pronto.', { duration: 15000 })
    }
  }, [secondsLeft])

  // ─── Data ────────────────────────────────────────────────────────────────

  const { data: paquetesAll = [] } = usePaquetesPublico()
  const { data: tiposEvento = [], isLoading: isLoadingTipos } = useTiposEventoPublico()
  const { data: extras = [] } = useExtrasPaquete(idPaquete)
  const { data: turnosApi = [] } = useTurnos(idSede)
  const turnos = useMemo(() => {
    if (turnosApi && turnosApi.length > 0) return turnosApi
    return [
      { id: 1, codigo: 'T1', nombre: 'Turno mañana', horaInicio: '10:00', horaFin: '14:00' },
      { id: 2, codigo: 'T2', nombre: 'Turno tarde', horaInicio: '16:00', horaFin: '20:00' },
    ]
  }, [turnosApi])
  const { data: servicios = [] } = useServiciosCotizacion()
  const { data: disponibilidades } = useDisponibilidadRango(idSede, fechaMin(), fechaMax())

  const tipoEventoSeleccionado = useMemo(
    () => tiposEvento.find((t) => t.codigo === tipoEvento) ?? null,
    [tiposEvento, tipoEvento]
  )
  const tipoEventoLabel = tipoEventoSeleccionado ? tipoEventoSeleccionado.nombre : null

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
      disponibilidades
        .filter((d) => !d.disponiblePrivado)
        .map((d) => d.fecha)
    )
  }, [disponibilidades])

  const paqueteSeleccionado = paquetesAll.find((p) => p.id === idPaquete) ?? null
  const turnoSeleccionado   = turnos.find((t) => t.id === idTurno) ?? null

  // Estimated budget from selected services (cotización path)
  const presupuestoEstimado = useMemo(
    () => servicios
      .filter((s) => serviciosCotizacion.includes(s.id))
      .reduce((sum, s) => sum + s.precioReferencial, 0),
    [serviciosCotizacion, servicios]
  )

  // Warn if invitados exceeds package limit
  const limitePersonas = paqueteSeleccionado?.limitepersonas ?? null
  const invitadosExcedeLimite = limitePersonas && invitados && invitados > limitePersonas

  // ─── Date selection ──────────────────────────────────────────────────────

  function intentarSeleccionarFecha(valor: string) {
    if (!valor) { setFecha(null); setIdTurno(null); return }
    const dias = Math.floor(
      (new Date(valor).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
    )
    if (dias < ANTICIPACION_MIN) {
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
        paso={paso}
        total={4}
        onSalir={() => router.push('/celebraciones')}
        secondsLeft={secondsLeft}
        timerProgress={timerProgress}
        timerPhase={timerPhase}
        timerDisplay={timerDisplay}
      />

      {/* Critical timer banner */}
      {timerPhase === 'critical' && (
        <div className="bg-red-600 text-white text-xs text-center py-1.5 px-4 font-semibold animate-pulse">
          ⚠️ Tu sesión expira en {timerDisplay} — completa la solicitud pronto
        </div>
      )}

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ─── PASO 1 ──────────────────────────────────────────────── */}
            {paso === 1 && (
              <div className="space-y-8 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 1 de 4
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">¿Qué celebramos?</h2>
                  <p className="text-sm text-gray-500 mt-1">Cuéntanos el tipo de evento que tienes en mente.</p>
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    {isLoadingTipos ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-11 w-28 bg-gray-100 rounded-xl animate-pulse" />
                      ))
                    ) : tiposEvento.length === 0 ? (
                      <p className="text-sm text-gray-400">No hay tipos de eventos disponibles en este momento.</p>
                    ) : (
                      tiposEvento.map((t) => (
                        <button
                          key={t.codigo}
                          type="button"
                          onClick={() => { setTipoEvento(t.codigo); setCamino(null); setIdPaquete(null) }}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-2',
                            tipoEvento === t.codigo
                              ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                              : 'border-gray-200 text-gray-600 hover:border-brand-rosa/40'
                          )}
                        >
                          {renderIconoTipoEvento(t.icono, 'h-4 w-4 shrink-0')}
                          <span>{t.nombre}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {tipoEvento && (
                  <div>
                    <h3 className="text-lg font-black text-gray-900">¿Cómo quieres organizarlo?</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Elige un paquete o pídenos una cotización a medida.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {paquetesFiltrados.map((paq) => (
                        <PaqueteCard
                          key={paq.id}
                          paquete={paq}
                          seleccionado={idPaquete === paq.id && camino === 'paquete'}
                          onSeleccionar={() => { setCamino('paquete'); setIdPaquete(paq.id) }}
                          onVerDetalle={() => setPaqueteDetalle(paq)}
                        />
                      ))}

                      {/* Always visible: custom quotation */}
                      <button
                        type="button"
                        onClick={() => { setCamino('cotizacion'); setIdPaquete(null) }}
                        className={cn(
                          'p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 bg-white',
                          camino === 'cotizacion'
                            ? 'border-brand-azul bg-brand-azul/5'
                            : 'border-dashed border-gray-300 hover:border-brand-azul/40'
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-brand-azul" />
                        </div>
                        <p className="font-black text-gray-900">Cotización personalizada</p>
                        <p className="text-xs text-gray-500">
                          Cuéntanos qué imaginas y te armamos una propuesta a medida.
                        </p>
                      </button>
                    </div>

                    {paquetesFiltrados.length === 0 && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mt-4">
                        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          No tenemos paquetes prediseñados para este tipo de evento, pero puedes solicitar una cotización personalizada.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2 h-12"
                  disabled={!canAdvance1}
                  onClick={() => setPaso(2)}
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ─── PASO 2 — Paquete ────────────────────────────────────── */}
            {paso === 2 && camino === 'paquete' && (
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 2 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Personaliza tu paquete</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega lo que quieras incluir. El precio final lo confirma el equipo.
                  </p>
                </div>

                {/* Package info summary */}
                {paqueteSeleccionado && (
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-1.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: paqueteSeleccionado.color ?? '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{paqueteSeleccionado.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{paqueteSeleccionado.descripcionCorta}</p>
                        {paqueteSeleccionado.limitepersonas && (
                          <p className="text-xs text-amber-600 font-medium mt-0.5">
                            Capacidad máxima: {paqueteSeleccionado.limitepersonas} personas
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col sm:items-end justify-between items-center border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0 w-full sm:w-auto border-gray-200/60">
                      <span className="sm:hidden text-xs text-gray-400 font-normal">Precio base:</span>
                      <p className="font-black text-brand-azul text-base">
                        {formatCurrency(paqueteSeleccionado.precio)}
                      </p>
                    </div>
                  </div>
                )}

                {extras.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Extras disponibles</Label>
                    <div className="space-y-2">
                      {extras.map((ex) => {
                        const marcado = extrasSeleccionados.includes(ex.id)
                        return (
                          <label
                            key={ex.id}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-azul/30 cursor-pointer transition-all bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={marcado}
                              onChange={() => toggleExtra(ex.id)}
                              className="w-5 h-5 rounded border-gray-300 text-brand-rosa focus:ring-brand-rosa shrink-0 mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{ex.nombre}</p>
                              {ex.descripcion && (
                                <p className="text-xs text-gray-500">{ex.descripcion}</p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Free text extras */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    ¿Algo más en mente?{' '}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <textarea
                    value={otrasIdeas}
                    onChange={(e) => setOtrasIdeas(e.target.value)}
                    placeholder="Cuéntanos cualquier idea adicional para tu evento"
                    rows={3}
                    maxLength={500}
                    className={cn(
                      'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white',
                      validationErrors.otrasIdeas ? 'border-red-400' : 'border-gray-200'
                    )}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <FieldError message={validationErrors.otrasIdeas} />
                    <span className={cn('text-gray-400 ml-auto', otrasIdeas.length > 450 && 'text-amber-600 font-semibold')}>
                      {otrasIdeas.length}/500
                    </span>
                  </div>
                </div>

                {/* Client budget */}
                <div className="space-y-1.5">
                  <Label htmlFor="presupuesto-paq" className="text-sm font-semibold">
                    ¿Cuál es tu presupuesto aproximado?{' '}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <p className="text-xs text-gray-400">
                    Este dato nos ayuda a preparar una propuesta ajustada a tus posibilidades.
                  </p>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="presupuesto-paq"
                      type="number"
                      placeholder="0"
                      min={1}
                      max={50000}
                      value={presupuestoCliente ?? ''}
                      onChange={(e) => setPresupuestoCliente(e.target.value ? parseFloat(e.target.value) : null)}
                      className={cn('h-11 rounded-xl pl-9', validationErrors.presupuestoCliente && 'border-red-400')}
                    />
                  </div>
                  <FieldError message={validationErrors.presupuestoCliente} />
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    El precio final incluirá los extras que elijas. Te enviaremos la cotización completa en 24–48 horas.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPaso(1)}>
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2"
                    disabled={!canAdvance2}
                    onClick={() => setPaso(3)}
                  >
                    Continuar <ChevronRight className="h-4 w-4" />
                  </Button>
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
                  <h2 className="text-2xl font-black text-gray-900">Cuéntanos tu idea</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mientras más nos cuentes, mejor será la propuesta que te preparemos.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Describe tu evento <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Cuéntanos qué tipo de celebración imaginas, la temática, el ambiente que buscas..."
                    rows={4}
                    maxLength={1000}
                    className={cn(
                      'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white',
                      validationErrors.descripcion ? 'border-red-400' : 'border-gray-200'
                    )}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <FieldError message={validationErrors.descripcion} />
                    {!validationErrors.descripcion && descripcion.length >= 30 && (
                      <span className="text-green-600 font-medium">✓ Descripción completa</span>
                    )}
                    <span className={cn('text-gray-400 ml-auto', descripcion.length > 950 && 'text-amber-600 font-semibold')}>
                      {descripcion.length}/1000
                    </span>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">¿Qué servicios te gustaría incluir?</Label>
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
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{servicio.nombre}</p>
                            {servicio.descripcion && (
                              <p className="text-xs text-gray-400 truncate">{servicio.descripcion}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              desde {formatCurrency(servicio.precioReferencial)}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                              activo ? 'bg-brand-azul border-brand-azul' : 'border-gray-300'
                            )}
                          >
                            {activo && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Estimated budget (sum of services) */}
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
                      Estimado orientativo. El precio final lo confirma el equipo tras revisar tu solicitud.
                    </p>
                  </div>
                )}

                {/* Number of guests */}
                <div className="space-y-1.5">
                  <Label htmlFor="invitados-coti" className="text-sm font-semibold">
                    Número aproximado de invitados <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="invitados-coti"
                      type="number"
                      value={invitados ?? ''}
                      onChange={(e) => setInvitados(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="20"
                      min={1}
                      max={500}
                      className={cn('h-11 rounded-xl pl-9', validationErrors.invitados && 'border-red-400')}
                    />
                  </div>
                  <FieldError message={validationErrors.invitados} />
                </div>

                {/* Client's own budget */}
                <div className="space-y-1.5">
                  <Label htmlFor="presupuesto-coti" className="text-sm font-semibold">
                    ¿Cuál es tu presupuesto aproximado?{' '}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <p className="text-xs text-gray-400">
                    Este dato nos ayuda a preparar una propuesta ajustada a tus posibilidades.
                  </p>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="presupuesto-coti"
                      type="number"
                      placeholder="0"
                      min={1}
                      max={50000}
                      value={presupuestoCliente ?? ''}
                      onChange={(e) => setPresupuestoCliente(e.target.value ? parseFloat(e.target.value) : null)}
                      className={cn('h-11 rounded-xl pl-9', validationErrors.presupuestoCliente && 'border-red-400')}
                    />
                  </div>
                  <FieldError message={validationErrors.presupuestoCliente} />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPaso(1)}>
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2"
                    disabled={!canAdvance2}
                    onClick={() => setPaso(3)}
                  >
                    Continuar <ChevronRight className="h-4 w-4" />
                  </Button>
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
                  <h2 className="text-2xl font-black text-gray-900">Fecha y detalles</h2>
                  <p className="text-sm text-gray-500 mt-1">Elige cuándo quieres tu evento.</p>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="fecha" className="text-sm font-semibold">Fecha del evento <span className="text-destructive">*</span></Label>
                  <p className="text-xs text-gray-400">
                    La reserva debe realizarse con al menos {ANTICIPACION_MIN} días de anticipación.
                  </p>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fecha"
                      type="date"
                      min={fechaMin()}
                      max={fechaMax()}
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
                    <Label className="text-sm font-semibold">Turno preferido <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {turnos.map((turno) => {
                        const disponible =
                          turno.codigo === 'T1'
                            ? (disponibilidadDia?.turnoT1Disponible ?? true)
                            : turno.codigo === 'T2'
                            ? (disponibilidadDia?.turnoT2Disponible ?? true)
                            : true
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
                              <p className="text-sm font-bold text-gray-900">{turno.nombre}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {turno.horaInicio} – {turno.horaFin}
                            </p>
                            {!disponible && (
                              <p className="text-[10px] text-red-500 font-semibold mt-0.5">No disponible</p>
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
                      <Label htmlFor="nombreNino" className="text-sm font-semibold">
                        Nombre del cumpleañero/a <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombreNino"
                        placeholder="Ej: María José"
                        value={nombreNino}
                        onChange={(e) => setNombreNino(e.target.value)}
                        className={cn('h-11 rounded-xl', validationErrors.nombreNino && 'border-red-400')}
                        maxLength={60}
                      />
                      <FieldError message={validationErrors.nombreNino} />
                      {!validationErrors.nombreNino && !nombreNino && (
                        <FieldError message="El nombre del niño es obligatorio para cumpleaños" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edadCumple" className="text-sm font-semibold">
                        Edad que cumple
                      </Label>
                      <Input
                        id="edadCumple"
                        type="number"
                        placeholder="5"
                        min={0}
                        max={17}
                        value={edadCumple ?? ''}
                        onChange={(e) => setEdadCumple(e.target.value ? parseInt(e.target.value) : null)}
                        className={cn('h-11 rounded-xl', validationErrors.edadCumple && 'border-red-400')}
                      />
                      <FieldError message={validationErrors.edadCumple} />
                      {edadCumple !== null && edadCumple >= 12 && !validationErrors.edadCumple && (
                        <FieldWarning message="Este paquete está pensado para niños. ¿Es correcto?" />
                      )}
                    </div>
                  </div>
                )}

                {/* Guests (both paths, required) */}
                <div className="space-y-1.5">
                  <Label htmlFor="invitados-paso3" className="text-sm font-semibold">
                    Número aproximado de invitados <span className="text-destructive">*</span>
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
                      onChange={(e) => setInvitados(e.target.value ? parseInt(e.target.value) : null)}
                      className={cn('h-11 rounded-xl pl-9', validationErrors.invitados && 'border-red-400')}
                    />
                  </div>
                  <FieldError message={validationErrors.invitados} />
                  {invitadosExcedeLimite && !validationErrors.invitados && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        El paquete seleccionado tiene un límite de {limitePersonas} personas. Si tienes más invitados, considera solicitar una cotización personalizada.
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="telefono" className="text-sm font-semibold">
                    Teléfono de contacto adicional{' '}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telefono"
                      placeholder="987654321"
                      value={telefonoAdicional}
                      onChange={(e) => setTelefonoAdicional(e.target.value)}
                      className={cn('h-11 rounded-xl pl-9', validationErrors.telefonoAdicional && 'border-red-400')}
                      maxLength={15}
                    />
                  </div>
                  <FieldError message={validationErrors.telefonoAdicional} />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPaso(2)}>
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
              <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 4 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Revisa tu solicitud</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirma los datos antes de enviar. Te contactaremos en menos de 24 horas.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                  {tipoEventoLabel && <FilaResumen label="Tipo de celebración" valor={tipoEventoLabel} />}
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
                      <FilaResumen label="Modalidad" valor="Cotización personalizada" />
                      {serviciosCotizacion.length > 0 && (
                        <FilaResumen
                          label="Servicios"
                          valor={serviciosCotizacion
                            .map((id) => servicios.find((s) => s.id === id)?.nombre)
                            .filter(Boolean)
                            .join(', ')}
                        />
                      )}
                      {presupuestoEstimado > 0 && (
                        <FilaResumen
                          label="Estimado servicios"
                          valor={<span className="text-brand-azul font-bold">{formatCurrency(presupuestoEstimado)}</span>}
                        />
                      )}
                    </>
                  )}
                  <FilaResumen label="Fecha" valor={fechaSel ? formatDate(fechaSel) : '—'} />
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
                  {invitados && <FilaResumen label="Invitados" valor={`~${invitados} personas`} />}
                  {presupuestoCliente && presupuestoCliente > 0 && (
                    <FilaResumen
                      label="Tu presupuesto"
                      valor={<span className="text-green-700 font-bold">{formatCurrency(presupuestoCliente)}</span>}
                    />
                  )}
                </div>

                {/* Time warning on step 4 */}
                {timerPhase !== 'safe' && (
                  <div className={cn(
                    'flex items-start gap-2 p-3 rounded-xl border',
                    timerPhase === 'critical' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-200'
                  )}>
                    <AlertTriangle className={cn('h-4 w-4 shrink-0 mt-0.5', timerPhase === 'critical' ? 'text-red-600' : 'text-amber-600')} />
                    <p className={cn('text-xs font-semibold', timerPhase === 'critical' ? 'text-red-800' : 'text-amber-800')}>
                      ⏳ Tu sesión expira en {timerDisplay}. ¡Envía ahora antes de que se cancele!
                    </p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800">
                    Al enviar aceptas nuestras condiciones de servicio. El precio final será
                    confirmado por el equipo según los detalles de tu solicitud.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPaso(3)}>
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl font-black text-base gap-2 h-12"
                    disabled={isSubmitting}
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
          <div className="hidden lg:block">
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

      {/* Package detail modal */}
      <PaqueteDetalleModal
        paquete={paqueteDetalle}
        open={!!paqueteDetalle}
        onClose={() => setPaqueteDetalle(null)}
        onElegir={(id) => { setCamino('paquete'); setIdPaquete(id) }}
      />

      {/* Anticipation warning modal */}
      <ModalAnticipacionEvento
        open={modalAnticipacion}
        onClose={() => setModalAnticipacion(false)}
        diasMinimos={ANTICIPACION_MIN}
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
