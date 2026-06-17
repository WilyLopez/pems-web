'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMutation } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import {
  CheckCircle,
  Clock,
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
} from 'lucide-react'
import Link from 'next/link'

import { eventoService } from '@/services/evento.service'
import { usePaquetesPublico } from '@/hooks/useComercial'
import { useExtrasPaquete, useTurnos, useServiciosCotizacion } from '@/hooks/useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { EventoPrivado } from '@/types/evento.types'
import { PaqueteEvento } from '@/types/comercial.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { WizardHeader } from '@/components/celebraciones/WizardHeader'
import { PaqueteCard } from '@/components/celebraciones/PaqueteCard'
import { PaqueteDetalleModal } from '@/components/celebraciones/PaqueteDetalleModal'
import { BannerWhatsApp } from '@/components/celebraciones/BannerWhatsApp'
import { ResumenEnVivo } from '@/components/celebraciones/ResumenEnVivo'
import { ResumenMovilExpandible } from '@/components/celebraciones/ResumenMovilExpandible'
import { ModalAnticipacionEvento } from '@/components/celebraciones/ModalAnticipacionEvento'

const ANTICIPACION_MIN = 15
const RANGO_DIAS        = 90

type TipoEvento = 'CUMPLEANOS' | 'BABY_SHOWER' | 'FIN_ANO' | 'TEMATICO' | 'FAMILIAR' | 'OTRO'
type Camino     = 'paquete' | 'cotizacion' | null

const TIPOS_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: 'CUMPLEANOS',  label: 'Cumpleaños' },
  { value: 'BABY_SHOWER', label: 'Baby Shower' },
  { value: 'FIN_ANO',     label: 'Fin de año escolar' },
  { value: 'TEMATICO',    label: 'Temático' },
  { value: 'FAMILIAR',    label: 'Familiar' },
  { value: 'OTRO',        label: 'Otro' },
]

const LABEL_TIPO: Record<TipoEvento, string> = Object.fromEntries(
  TIPOS_EVENTO.map((t) => [t.value, t.label])
) as Record<TipoEvento, string>

function fechaMin() { return format(addDays(new Date(), ANTICIPACION_MIN), 'yyyy-MM-dd') }
function fechaMax() { return format(addDays(new Date(), RANGO_DIAS), 'yyyy-MM-dd') }

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

function SuccessView({ evento }: { evento: EventoPrivado }) {
  const whatsappUrl = useWhatsAppUrl('Hola, acabo de solicitar un evento y quiero confirmar los detalles')

  return (
    <div className="flex flex-col items-center text-center py-16 space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">Solicitud enviada</h2>
        <p className="text-gray-500">
          Nuestro equipo se pondrá en contacto contigo en menos de 24 horas para confirmar los detalles.
        </p>
      </div>

      <Card className="w-full text-left border border-gray-100 shadow-card rounded-2xl">
        <CardContent className="p-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-semibold">{formatDate(evento.fechaEvento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Turno</span>
            <span>{evento.turno} · {evento.horaInicio}–{evento.horaFin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo</span>
            <span>{evento.tipoEvento}</span>
          </div>
          <Separator />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
            {evento.estado}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="outline" asChild className="flex-1 rounded-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-green-300 text-green-700 hover:bg-green-50 font-semibold py-2 text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <Button asChild className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2">
          <Link href="/cliente/mis-eventos">
            <PartyPopper className="h-4 w-4" />
            Mis eventos
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function SolicitarEventoPage() {
  const router = useRouter()
  const { idSede: idSedeAuth, idUsuario, isAuthenticated } = useAuth()

  const idSede = idSedeAuth ?? 1

  const [paso,                setPaso]                = useState<1 | 2 | 3 | 4>(1)
  const [modalAnticipacion,   setModalAnticipacion]   = useState(false)
  const [tipoEvento,          setTipoEvento]          = useState<TipoEvento | null>(null)
  const [camino,              setCamino]              = useState<Camino>(null)
  const [idPaquete,           setIdPaquete]           = useState<number | null>(null)
  const [paqueteDetalle,      setPaqueteDetalle]      = useState<PaqueteEvento | null>(null)
  const [extrasSeleccionados, setExtras]              = useState<number[]>([])
  const [otrasIdeas,          setOtrasIdeas]          = useState('')
  const [descripcion,         setDescripcion]         = useState('')
  const [serviciosCotizacion, setServiciosCotizacion] = useState<number[]>([])
  const [fechaSel,            setFecha]               = useState<string | null>(null)
  const [idTurno,             setIdTurno]             = useState<number | null>(null)
  const [nombreNino,          setNombreNino]          = useState('')
  const [edadCumple,          setEdadCumple]          = useState<number | null>(null)
  const [invitados,           setInvitados]           = useState<number | null>(null)
  const [telefonoAdicional,   setTelefonoAdicional]   = useState('')
  const [eventoCreado,        setEventoCreado]        = useState<EventoPrivado | null>(null)

  const { data: paquetes   = [] } = usePaquetesPublico()
  const { data: extras     = [] } = useExtrasPaquete(idPaquete)
  const { data: turnos     = [] } = useTurnos(idSede)
  const { data: servicios  = [] } = useServiciosCotizacion()
  const { data: disponibilidades } = useDisponibilidadRango(idSede, fechaMin(), fechaMax())

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

  const presupuestoEstimado = useMemo(
    () => servicios
      .filter((s) => serviciosCotizacion.includes(s.id))
      .reduce((sum, s) => sum + s.precioReferencial, 0),
    [serviciosCotizacion, servicios]
  )

  const paqueteSeleccionado = paquetes.find((p) => p.id === idPaquete) ?? null
  const turnoSeleccionado   = turnos.find((t) => t.id === idTurno) ?? null

  function toggleExtra(id: number) {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleServicio(id: number) {
    setServiciosCotizacion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const canAdvance1 = tipoEvento !== null && camino !== null
  const canAdvance2 =
    camino === 'paquete'
      ? true
      : descripcion.length >= 30 && invitados !== null && invitados > 0
  const canAdvance3 = fechaSel !== null && !fechasOcupadas.has(fechaSel ?? '') && idTurno !== null

  const solicitar = useMutation({
    mutationFn: () => {
      if (!isAuthenticated || !idTurno || !fechaSel || !tipoEvento) throw new Error('Datos incompletos')
      return eventoService.solicitar(idUsuario!, idSede, {
        idTurno,
        fechaEvento:              fechaSel,
        tipoEvento:               LABEL_TIPO[tipoEvento],
        idPaquete:                camino === 'paquete' ? idPaquete ?? undefined : undefined,
        idsExtras:                camino === 'paquete' && extrasSeleccionados.length > 0 ? extrasSeleccionados : undefined,
        extrasLibres:             camino === 'paquete' && otrasIdeas.trim() ? [otrasIdeas.trim()] : undefined,
        esCotizacionPersonalizada: camino === 'cotizacion',
        descripcionPersonalizada: camino === 'cotizacion' ? descripcion : undefined,
        idsServiciosCotizacion:   camino === 'cotizacion' && serviciosCotizacion.length > 0 ? serviciosCotizacion : undefined,
        presupuestoEstimado:      camino === 'cotizacion' && presupuestoEstimado > 0 ? presupuestoEstimado : undefined,
        aforoDeclarado:           invitados ?? undefined,
        contactoAdicional:        telefonoAdicional || undefined,
        nombreNino:               tipoEvento === 'CUMPLEANOS' && nombreNino ? nombreNino : undefined,
        edadCumple:               tipoEvento === 'CUMPLEANOS' && edadCumple ? edadCumple : undefined,
      })
    },
    onSuccess: (evento) => setEventoCreado(evento),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo enviar la solicitud.'),
  })

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoginGuard />
      </div>
    )
  }

  if (eventoCreado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <SuccessView evento={eventoCreado} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <WizardHeader
        paso={paso}
        total={4}
        onSalir={() => router.push('/celebraciones')}
      />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {paso === 1 && (
              <div className="space-y-8">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 1 de 4
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">¿Qué celebramos?</h2>
                  <p className="text-sm text-gray-500 mt-1">Cuéntanos el tipo de evento que tienes en mente.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {TIPOS_EVENTO.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTipoEvento(t.value)}
                        className={cn(
                          'px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                          tipoEvento === t.value
                            ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                            : 'border-gray-200 text-gray-600 hover:border-brand-rosa/40'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {tipoEvento && (
                  <div>
                    <h3 className="text-lg font-black text-gray-900">¿Cómo quieres organizarlo?</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Elige un paquete o pídenos una cotización a medida.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {paquetes.map((paq) => (
                        <PaqueteCard
                          key={paq.id}
                          paquete={paq}
                          seleccionado={idPaquete === paq.id && camino === 'paquete'}
                          onSeleccionar={() => { setCamino('paquete'); setIdPaquete(paq.id) }}
                          onVerDetalle={() => setPaqueteDetalle(paq)}
                        />
                      ))}

                      <button
                        type="button"
                        onClick={() => { setCamino('cotizacion'); setIdPaquete(null) }}
                        className={cn(
                          'p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2',
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
                  </div>
                )}

                <BannerWhatsApp tipoEvento={tipoEvento ? LABEL_TIPO[tipoEvento] : null} />

                <Button
                  className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2 h-12"
                  disabled={!canAdvance1}
                  onClick={() => setPaso(2)}
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {paso === 2 && camino === 'paquete' && (
              <div className="space-y-5">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 2 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Personaliza tu paquete</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega lo que quieras incluir. El precio final lo confirma el equipo.
                  </p>
                </div>

                {extras.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Extras disponibles</Label>
                    <div className="space-y-2">
                      {extras.map((ex) => {
                        const marcado = extrasSeleccionados.includes(ex.id)
                        return (
                          <label
                            key={ex.id}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-azul/30 cursor-pointer transition-all"
                          >
                            <div
                              className={cn(
                                'w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center',
                                marcado ? 'bg-brand-rosa border-brand-rosa' : 'border-gray-300'
                              )}
                              onClick={() => toggleExtra(ex.id)}
                            >
                              {marcado && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div onClick={() => toggleExtra(ex.id)}>
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

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    ¿Algo más en mente? <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <textarea
                    value={otrasIdeas}
                    onChange={(e) => setOtrasIdeas(e.target.value)}
                    placeholder="Cuéntanos cualquier idea adicional para tu evento"
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    El precio final incluirá los extras que elijas. Te enviaremos la cotización completa en 24–48 horas.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setPaso(1)}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2"
                    onClick={() => setPaso(3)}
                  >
                    Continuar <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {paso === 2 && camino === 'cotizacion' && (
              <div className="space-y-5">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 2 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Cuéntanos tu idea</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mientras más nos cuentes, mejor será la propuesta que te preparemos.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Describe tu evento <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Cuéntanos qué tipo de celebración imaginas, la temática, el ambiente que buscas..."
                    rows={4}
                    className={cn(
                      'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa',
                      descripcion.length > 0 && descripcion.length < 30
                        ? 'border-amber-400'
                        : 'border-gray-200'
                    )}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        descripcion.length < 30 ? 'text-amber-600' : 'text-green-600'
                      )}
                    >
                      {descripcion.length < 30
                        ? `Faltan ${30 - descripcion.length} caracteres (mínimo 30)`
                        : 'Descripción completa'}
                    </span>
                    <span className="text-gray-400">{descripcion.length} caracteres</span>
                  </div>
                </div>

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
                            'flex items-center justify-between gap-2 p-3 rounded-xl border-2 text-left transition-all',
                            activo
                              ? 'border-brand-azul bg-brand-azul/5'
                              : 'border-gray-200 hover:border-brand-azul/30'
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {servicio.nombre}
                            </p>
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

                {presupuestoEstimado > 0 && (
                  <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Presupuesto estimado
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

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Número aproximado de invitados <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={invitados ?? ''}
                      onChange={(e) => setInvitados(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="20"
                      min={1}
                      max={200}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setPaso(1)}
                  >
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

            {paso === 3 && (
              <div className="space-y-5">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 3 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Fecha y detalles</h2>
                  <p className="text-sm text-gray-500 mt-1">Elige cuándo quieres tu evento.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fecha" className="text-sm font-semibold">Fecha del evento</Label>
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
                    <p className="text-xs text-destructive">Fecha no disponible. Selecciona otra.</p>
                  )}
                </div>

                {fechaSel && !fechasOcupadas.has(fechaSel) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Turno preferido</Label>
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
                              'border rounded-xl p-3.5 text-left transition-all',
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
                        className="h-11 rounded-xl"
                        maxLength={120}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edadCumple" className="text-sm font-semibold">
                        Edad que cumple
                      </Label>
                      <Input
                        id="edadCumple"
                        type="number"
                        placeholder="5"
                        min={1}
                        max={18}
                        value={edadCumple ?? ''}
                        onChange={(e) => setEdadCumple(e.target.value ? parseInt(e.target.value) : null)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {camino === 'paquete' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="invitados" className="text-sm font-semibold">
                      Número aproximado de invitados <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="invitados"
                        type="number"
                        placeholder="20"
                        min={1}
                        max={200}
                        value={invitados ?? ''}
                        onChange={(e) => setInvitados(e.target.value ? parseInt(e.target.value) : null)}
                        className="h-11 rounded-xl pl-9"
                      />
                    </div>
                  </div>
                )}

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
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
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

            {paso === 4 && (
              <div className="space-y-5">
                <div>
                  <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
                    Paso 4 de 4
                  </Badge>
                  <h2 className="text-2xl font-black text-gray-900">Revisa tu solicitud</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirma los datos antes de enviar. Te contactaremos en menos de 24 horas.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                  {tipoEvento && (
                    <FilaResumen label="Tipo de celebración" valor={LABEL_TIPO[tipoEvento]} />
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
                          label="Presupuesto estimado"
                          valor={
                            <span className="text-brand-azul font-bold">
                              {formatCurrency(presupuestoEstimado)}
                            </span>
                          }
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
                      valor={`${nombreNino}${edadCumple ? ` · ${edadCumple} años` : ''}`}
                    />
                  )}
                  {invitados && (
                    <FilaResumen label="Invitados" valor={`~${invitados} personas`} />
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800">
                    Al enviar aceptas nuestras condiciones de servicio. El precio final será
                    confirmado por el equipo según los detalles de tu solicitud.
                  </p>
                </div>

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
                    disabled={solicitar.isPending}
                    onClick={() => solicitar.mutate()}
                  >
                    {solicitar.isPending ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
                    ) : (
                      <><PartyPopper className="h-5 w-5" /> Enviar solicitud</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <ResumenEnVivo
              tipoEvento={tipoEvento}
              camino={camino}
              paquete={paqueteSeleccionado}
              extras={extras}
              extrasSeleccionados={extrasSeleccionados}
              serviciosCotizacion={serviciosCotizacion}
              servicios={servicios}
              presupuestoEstimado={presupuestoEstimado}
              fecha={fechaSel}
              turno={turnoSeleccionado}
              nombreNino={nombreNino}
              edadCumple={edadCumple}
              invitados={invitados}
            />
          </div>
        </div>
      </div>

      <ResumenMovilExpandible
        tipoEvento={tipoEvento}
        camino={camino}
        paquete={paqueteSeleccionado}
        extras={extras}
        extrasSeleccionados={extrasSeleccionados}
        serviciosCotizacion={serviciosCotizacion}
        servicios={servicios}
        presupuestoEstimado={presupuestoEstimado}
        fecha={fechaSel}
        turno={turnoSeleccionado}
      />

      <PaqueteDetalleModal
        paquete={paqueteDetalle}
        open={!!paqueteDetalle}
        onClose={() => setPaqueteDetalle(null)}
        onElegir={(id) => { setCamino('paquete'); setIdPaquete(id) }}
      />

      <ModalAnticipacionEvento
        open={modalAnticipacion}
        onClose={() => setModalAnticipacion(false)}
        diasMinimos={ANTICIPACION_MIN}
      />
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
