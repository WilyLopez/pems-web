'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { addDays, format, parseISO, startOfDay, isBefore } from 'date-fns'
import { toast } from 'sonner'
import {
  PartyPopper,
  CheckCircle,
  Clock,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Phone,
  MessageCircle,
  Star,
  Check,
  Baby,
} from 'lucide-react'
import Link from 'next/link'

import { eventoService } from '@/services/evento.service'
import { usePaquetesPublico } from '@/hooks/useComercial'
import { useExtrasPaquete, useTurnos } from '@/hooks/useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { EventoPrivado } from '@/types/evento.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency } from '@/lib/utils'

const ANTICIPACION_MIN = 15
const RANGO_DIAS        = 90

const TIPOS_EVENTO = [
  'Cumpleaños',
  'Baby Shower',
  'Fin de año escolar',
  'Temático',
  'Familiar',
  'Otro',
]

function fechaMin() {
  return format(addDays(new Date(), ANTICIPACION_MIN), 'yyyy-MM-dd')
}
function fechaMax() {
  return format(addDays(new Date(), RANGO_DIAS), 'yyyy-MM-dd')
}

function LoginGuard({ redirect }: { redirect: string }) {
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
          <Link href={`/auth/login?callbackUrl=${encodeURIComponent(redirect)}`}>
            Iniciar sesión
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/auth/registro?callbackUrl=${encodeURIComponent(redirect)}`}>
            Crear cuenta
          </Link>
        </Button>
      </div>
    </div>
  )
}

function PasoIndicador({ paso, total }: { paso: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < paso ? 'bg-brand-rosa w-6' : i === paso - 1 ? 'bg-brand-rosa w-8' : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  )
}

function SuccessView({ evento }: { evento: EventoPrivado }) {
  const whatsappUrl = useWhatsAppUrl('Hola, acabo de solicitar un evento privado y quiero confirmar los detalles')

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
            <span className="text-gray-500">Fecha solicitada</span>
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
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { data: session, status } = useSession()

  const idSede    = session?.user?.idSede ?? 1
  const paqueteParam = searchParams.get('paquete') ?? ''

  const [paso,               setPaso]               = useState<1 | 2 | 3 | 4>(1)
  const [idPaquete,          setIdPaquete]           = useState<number | null>(null)
  const [extrasSeleccionados, setExtras]             = useState<number[]>([])
  const [otrasIdeas,         setOtrasIdeas]          = useState('')
  const [fechaSel,           setFecha]               = useState<string | null>(null)
  const [idTurno,            setIdTurno]             = useState<number | null>(null)
  const [tipoEvento,         setTipoEvento]          = useState('')
  const [nombreNino,         setNombreNino]          = useState('')
  const [edadCumple,         setEdadCumple]          = useState('')
  const [invitados,          setInvitados]           = useState('')
  const [contactoAdicional,  setContactoAdicional]   = useState('')
  const [eventoCreado,       setEventoCreado]        = useState<EventoPrivado | null>(null)

  const whatsappUrl = useWhatsAppUrl('Hola, quisiera coordinar un evento privado')

  const { data: paquetes = [] }    = usePaquetesPublico()
  const { data: extras   = [] }    = useExtrasPaquete(idPaquete)
  const { data: turnos   = [] }    = useTurnos(idSede)
  const { data: disponibilidades } = useDisponibilidadRango(
    idSede,
    fechaMin(),
    fechaMax()
  )

  const disponibilidadDia = useMemo(
    () => disponibilidades?.find((d) => d.fecha === fechaSel),
    [disponibilidades, fechaSel]
  )

  const fechasOcupadas = useMemo(() => {
    if (!disponibilidades) return new Set<string>()
    return new Set(
      disponibilidades
        .filter((d) => !d.turnoT1Disponible && !d.turnoT2Disponible)
        .map((d) => d.fecha)
    )
  }, [disponibilidades])

  const solicitar = useMutation({
    mutationFn: () => {
      if (!session || !idTurno || !fechaSel) throw new Error('Datos incompletos')
      return eventoService.solicitar(Number(session.user.id), idSede, {
        idTurno,
        fechaEvento:       fechaSel,
        tipoEvento:        tipoEvento || 'Evento privado',
        nombreNino:        tipoEvento === 'Cumpleaños' && nombreNino ? nombreNino : undefined,
        edadCumple:        tipoEvento === 'Cumpleaños' && edadCumple ? parseInt(edadCumple) : undefined,
        idPaquete:         idPaquete ?? undefined,
        idsExtras:         extrasSeleccionados.length > 0 ? extrasSeleccionados : undefined,
        extrasLibres:      otrasIdeas.trim() ? [otrasIdeas.trim()] : undefined,
        aforoDeclarado:    invitados ? parseInt(invitados) : undefined,
        contactoAdicional: contactoAdicional || undefined,
        observaciones:     undefined,
      })
    },
    onSuccess: (evento) => setEventoCreado(evento),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo enviar la solicitud.'),
  })

  if (status === 'loading') {
    return (
      <div className="container max-w-3xl mx-auto px-4 pt-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-rosa" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <LoginGuard redirect="/celebraciones/solicitar" />
      </div>
    )
  }

  if (eventoCreado) {
    return (
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <SuccessView evento={eventoCreado} />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-gray-500 hover:text-brand-rosa -ml-2"
          onClick={() => (paso === 1 ? router.push('/celebraciones') : setPaso((p) => (p - 1) as 1 | 2 | 3 | 4))}
        >
          <ChevronLeft className="h-4 w-4" />
          {paso === 1 ? 'Volver a paquetes' : 'Atrás'}
        </Button>
        <div className="flex-1">
          <PasoIndicador paso={paso} total={4} />
        </div>
        <span className="text-xs text-gray-400">Paso {paso} de 4</span>
      </div>

      {paso === 1 && (
        <div className="space-y-5">
          <div>
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">Paso 1</Badge>
            <h1 className="text-2xl font-black text-gray-900">Elige tu paquete</h1>
            <p className="text-sm text-gray-500 mt-1">Selecciona el paquete base para tu evento.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paquetes.map((paq) => {
              const seleccionado = idPaquete === paq.id
              return (
                <button
                  key={paq.id}
                  type="button"
                  onClick={() => {
                    setIdPaquete(paq.id)
                    if (!tipoEvento && paq.slug) {
                      setTipoEvento(paq.nombre)
                    }
                  }}
                  className={`text-left border-2 rounded-2xl p-4 transition-all ${
                    seleccionado
                      ? 'border-brand-rosa bg-brand-rosa/5 ring-1 ring-brand-rosa'
                      : 'border-gray-100 hover:border-brand-rosa/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Star className={`h-5 w-5 ${seleccionado ? 'text-brand-rosa' : 'text-gray-300'}`} />
                    {seleccionado && <Check className="h-4 w-4 text-brand-rosa" />}
                  </div>
                  <p className="font-bold text-gray-900">{paq.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{paq.descripcionCorta}</p>
                  <p className="text-base font-black text-brand-azul mt-2">{formatCurrency(paq.precio)}</p>
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setIdPaquete(null)}
              className={`text-left border-2 rounded-2xl p-4 transition-all ${
                idPaquete === null
                  ? 'border-brand-rosa bg-brand-rosa/5 ring-1 ring-brand-rosa'
                  : 'border-gray-100 hover:border-brand-rosa/40'
              }`}
            >
              <MessageCircle className={`h-5 w-5 mb-2 ${idPaquete === null ? 'text-brand-rosa' : 'text-gray-300'}`} />
              <p className="font-bold text-gray-900">Cotización personalizada</p>
              <p className="text-xs text-gray-500 mt-0.5">Cuéntanos qué tienes en mente y te preparamos una propuesta.</p>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2"
              onClick={() => setPaso(2)}
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-green-300 text-green-700 hover:bg-green-50 font-semibold py-2 px-5 text-sm"
              >
                <Phone className="h-4 w-4" />
                Cotizar por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-5">
          <div>
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">Paso 2</Badge>
            <h1 className="text-2xl font-black text-gray-900">Personaliza tu evento</h1>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona los extras que deseas incluir. El precio final lo confirma el equipo.
            </p>
          </div>

          {extras.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Extras disponibles</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {extras.map((ex) => {
                  const marcado = extrasSeleccionados.includes(ex.id)
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() =>
                        setExtras((prev) =>
                          marcado ? prev.filter((id) => id !== ex.id) : [...prev, ex.id]
                        )
                      }
                      className={`flex items-start gap-3 border rounded-xl p-3 text-left transition-all ${
                        marcado ? 'border-brand-rosa bg-brand-rosa/5' : 'border-gray-100 hover:border-brand-rosa/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                        marcado ? 'bg-brand-rosa border-brand-rosa' : 'border-gray-300'
                      }`}>
                        {marcado && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{ex.nombre}</p>
                        {ex.descripcion && <p className="text-xs text-gray-500 mt-0.5">{ex.descripcion}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Otras ideas o detalles adicionales</Label>
            <textarea
              value={otrasIdeas}
              onChange={(e) => setOtrasIdeas(e.target.value)}
              placeholder="Cuéntanos qué más tienes en mente para tu evento..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa"
            />
          </div>

          {idPaquete === null && extras.length === 0 && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
              Sin paquete seleccionado. Cuéntanos en el campo de arriba qué tipo de evento deseas.
            </p>
          )}

          <Button
            className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2"
            onClick={() => setPaso(3)}
          >
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-5">
          <div>
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">Paso 3</Badge>
            <h1 className="text-2xl font-black text-gray-900">Fecha, turno y detalles</h1>
            <p className="text-sm text-gray-500 mt-1">
              Elige la fecha y turno para tu evento. Solo se muestran los disponibles.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha" className="text-sm font-semibold">
              Fecha del evento
            </Label>
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
                onChange={(e) => {
                  setFecha(e.target.value)
                  setIdTurno(null)
                }}
                className="h-11 rounded-xl pl-9"
              />
            </div>
            {fechaSel && fechasOcupadas.has(fechaSel) && (
              <p className="text-xs text-destructive">
                Fecha no disponible. Selecciona otra fecha.
              </p>
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
                      className={`border rounded-xl p-3.5 text-left transition-all ${
                        !disponible
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : seleccionado
                          ? 'border-brand-rosa bg-brand-rosa/6 ring-1 ring-brand-rosa'
                          : 'border-gray-200 hover:border-brand-rosa/40'
                      }`}
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

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Tipo de celebración</Label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_EVENTO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoEvento(tipo)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    tipoEvento === tipo
                      ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                      : 'border-gray-200 text-gray-600 hover:border-brand-rosa/40'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {tipoEvento === 'Cumpleaños' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombreNino" className="text-sm font-semibold flex items-center gap-1.5">
                  <Baby className="h-3.5 w-3.5" /> Nombre del niño/a
                </Label>
                <Input
                  id="nombreNino"
                  placeholder="María José"
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
                  value={edadCumple}
                  onChange={(e) => setEdadCumple(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invitados" className="text-sm font-semibold">
                Número de invitados <span className="text-gray-400 font-normal">(aprox.)</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="invitados"
                  type="number"
                  placeholder="20"
                  min={1}
                  max={60}
                  value={invitados}
                  onChange={(e) => setInvitados(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contacto" className="text-sm font-semibold">
                Teléfono adicional <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="contacto"
                  placeholder="987654321"
                  value={contactoAdicional}
                  onChange={(e) => setContactoAdicional(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2"
            disabled={!fechaSel || !idTurno || !tipoEvento}
            onClick={() => setPaso(4)}
          >
            Ver resumen <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {paso === 4 && (
        <div className="space-y-5">
          <div>
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">Paso 4</Badge>
            <h1 className="text-2xl font-black text-gray-900">Resumen de tu solicitud</h1>
            <p className="text-sm text-gray-500 mt-1">
              Revisa los datos antes de enviar. Nos pondremos en contacto en menos de 24 horas.
            </p>
          </div>

          <Card className="border border-gray-100 shadow-card rounded-2xl">
            <CardContent className="p-5 space-y-3 text-sm">
              {idPaquete && paquetes.find((p) => p.id === idPaquete) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paquete</span>
                  <span className="font-semibold">{paquetes.find((p) => p.id === idPaquete)?.nombre}</span>
                </div>
              )}
              {extrasSeleccionados.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Extras</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {extrasSeleccionados.map((id) => {
                      const ex = extras.find((e) => e.id === id)
                      return ex ? (
                        <span key={id} className="text-xs bg-brand-rosa/10 text-brand-rosa px-2 py-0.5 rounded-full">
                          {ex.nombre}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha</span>
                <span className="font-semibold">{fechaSel ? formatDate(fechaSel) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Turno</span>
                <span className="font-semibold">
                  {turnos.find((t) => t.id === idTurno)?.nombre ?? '—'}{' '}
                  {turnos.find((t) => t.id === idTurno)
                    ? `· ${turnos.find((t) => t.id === idTurno)!.horaInicio}–${turnos.find((t) => t.id === idTurno)!.horaFin}`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo</span>
                <span className="font-semibold">{tipoEvento || '—'}</span>
              </div>
              {tipoEvento === 'Cumpleaños' && nombreNino && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Niño/a</span>
                  <span className="font-semibold">
                    {nombreNino}{edadCumple ? ` · ${edadCumple} años` : ''}
                  </span>
                </div>
              )}
              {invitados && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Invitados</span>
                  <span className="font-semibold">{invitados} personas</span>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-gray-400 text-center">
            Al enviar aceptas nuestras condiciones de servicio. El precio final será confirmado por el equipo.
          </p>

          <Button
            className="w-full h-12 bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full gap-2 text-base"
            disabled={solicitar.isPending || !fechaSel || !idTurno}
            onClick={() => solicitar.mutate()}
          >
            {solicitar.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <PartyPopper className="h-5 w-5" />
                Enviar solicitud
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
