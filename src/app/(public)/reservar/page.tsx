'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isToday,
  isBefore,
  startOfDay,
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
} from 'lucide-react'
import Link from 'next/link'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { reservaService } from '@/services/reserva.service'
import { reservaSchema, ReservaFormValues } from '@/lib/validations/reserva.schema'
import { Reserva, MedioPago } from '@/types/reserva.types'
import { Disponibilidad } from '@/types/calendario.types'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/lib/utils'

const SEDE_ID = 1
const DIAS_MAX_RESERVA = 14
const SEMANAS_MAX = Math.ceil(DIAS_MAX_RESERVA / 7)

type PasoReserva = 1 | 2 | 3 | 4

function StepIndicator({ paso }: { paso: PasoReserva }) {
  const pasos = [
    { n: 1, label: 'Fecha' },
    { n: 2, label: 'Datos' },
    { n: 3, label: 'Pago' },
  ]
  return (
    <div className="flex items-center gap-2 mb-8">
      {pasos.map((p, i) => (
        <div key={p.n} className="flex items-center gap-2">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
              paso > p.n
                ? 'bg-green-500 text-white'
                : paso === p.n
                ? 'bg-brand-azul text-white'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            {paso > p.n ? <CheckCircle2 className="h-4 w-4" /> : p.n}
          </div>
          <span
            className={cn(
              'text-xs font-semibold hidden sm:block',
              paso === p.n ? 'text-brand-azul' : 'text-gray-400'
            )}
          >
            {p.label}
          </span>
          {i < pasos.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 w-8 mx-1',
                paso > p.n ? 'bg-green-400' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function AuthGuard({ fecha }: { fecha: string | null }) {
  const callbackUrl = fecha ? `/reservar?fecha=${fecha}` : '/reservar'
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-brand-azul/10 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-brand-azul" />
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Inicia sesion para reservar
        </h2>
        <p className="text-sm text-gray-500">
          Necesitas una cuenta para comprar tu entrada a la zona de juegos.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 bg-brand-azul text-white rounded-xl font-bold text-sm text-center hover:bg-brand-azul/90 transition-colors"
        >
          Iniciar sesion
        </Link>
        <Link
          href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm text-center hover:border-gray-300 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  )
}

function PrecioLabel({ tipoDia }: { tipoDia?: string }) {
  const precio = tipoDia === 'SEMANA' ? 25 : 35
  return <span className="font-black text-brand-azul">S/ {precio}</span>
}

export default function ReservarPage() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [paso, setPaso] = useState<PasoReserva>(1)
  const [fechaSeleccionada, setFecha] = useState<string | null>(null)
  const [dispSeleccionada, setDispSeleccionada] = useState<Disponibilidad | null>(null)
  const [semanaOffset, setSemanaOffset] = useState(0)

  const [metodoPago, setMetodoPago] = useState<MedioPago | null>(null)
  const [codigoYape, setCodigoYape] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [reservaCreada, setReservaCreada] = useState<Reserva | null>(null)

  useEffect(() => {
    const fecha = searchParams.get('fecha')
    if (fecha) {
      setFecha(fecha)
      setPaso(2)
    }
  }, [searchParams])

  const semanaInicio = startOfWeek(addWeeks(new Date(), semanaOffset), { weekStartsOn: 1 })
  const semanaFin = endOfWeek(semanaInicio, { weekStartsOn: 1 })

  const { data: disponibilidades, isLoading: loadingDisp } = useDisponibilidadRango(
    SEDE_ID,
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
    formState: { errors },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
  })

  const crear = useMutation({
    mutationFn: (payload: Parameters<typeof reservaService.crear>[2]) =>
      reservaService.crear(Number(session?.user?.id), SEDE_ID, payload),
    onSuccess: async (reserva) => {
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
      toast.error(err?.message ?? 'No se pudo crear la reserva. Intenta nuevamente.')
    },
  })

  if (status === 'loading') return null

  if (!session) return <AuthGuard fecha={fechaSeleccionada} />

  async function confirmarReserva() {
    setIntentoEnvio(true)
    if (!metodoPago) return
    if (metodoPago === 'YAPE' && !comprobante) return

    const valores = getValues()
    crear.mutate({
      canalReserva: 'ONLINE',
      fechaEvento: fechaSeleccionada!,
      nombreNino: valores.nombreNino,
      edadNino: valores.edadNino,
      nombreAcompanante: valores.nombreAcompanante,
      dniAcompanante: valores.dniAcompanante,
      firmoConsentimiento: true,
      medioPago: metodoPago!,
      referenciaPago: codigoYape || undefined,
    })
  }

  if (paso === 4 && reservaCreada) {
    return (
      <div className="container max-w-lg mx-auto px-4 pt-24 pb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Reserva confirmada</h2>
            <p className="text-sm text-gray-500 mt-1">Tu ticket ha sido generado exitosamente</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">Ticket</span>
              <span className="font-mono font-black text-brand-azul text-sm">
                {reservaCreada.numeroTicket}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estado</span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-1 rounded-full',
                  reservaCreada.estado === 'PENDIENTE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                )}
              >
                {reservaCreada.estado}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha</span>
                <span className="font-semibold">
                  {format(parseISO(reservaCreada.fechaEvento), "d 'de' MMMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nino</span>
                <span className="font-semibold">{reservaCreada.nombreNino}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-black text-green-700">
                  S/ {reservaCreada.totalPagado}
                </span>
              </div>
            </div>
          </div>

          {reservaCreada.estado === 'PENDIENTE' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
              <p className="text-xs font-bold text-amber-800">
                {reservaCreada.medioPago === 'YAPE'
                  ? 'Comprobante recibido. Nuestro equipo lo validara en los proximos minutos.'
                  : 'Recuerda pagar en caja al llegar al local para confirmar tu ingreso.'}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Recibiras un correo con tu ticket en PDF en{' '}
            <strong>{session?.user?.email}</strong>
          </p>

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
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-300 transition-colors"
            >
              Nueva reserva
            </button>
            <Link
              href="/cliente/mis-reservas"
              className="flex-1 py-2.5 bg-brand-azul text-white rounded-xl font-bold text-sm text-center hover:bg-brand-azul/90 transition-colors"
            >
              Ver mis entradas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
      <StepIndicator paso={paso} />

      {paso === 1 && (
        <div className="space-y-4">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Selecciona una fecha
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Elige el dia en que deseas visitar Kiki y Lala
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Puedes reservar hasta con {DIAS_MAX_RESERVA} dias de anticipacion.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 capitalize text-sm">
                {format(semanaInicio, "'Semana del' d 'de' MMMM yyyy", { locale: es })}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setSemanaOffset((o) => o - 1)}
                  disabled={semanaOffset <= 0}
                  className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSemanaOffset((o) => o + 1)}
                  disabled={semanaOffset >= SEMANAS_MAX - 1}
                  className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingDisp ? (
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {dias.map((dia) => {
                  const disp = getDisp(dia)
                  const hoy = startOfDay(new Date())
                  const pasado = isBefore(dia, hoy)
                  const disabled = pasado || !disp || !disp.disponiblePublico
                  const seleccionado = fechaSeleccionada === format(dia, 'yyyy-MM-dd')

                  return (
                    <button
                      key={dia.toISOString()}
                      disabled={disabled}
                      onClick={() => {
                        const f = format(dia, 'yyyy-MM-dd')
                        setFecha(f)
                        setDispSeleccionada(disp ?? null)
                      }}
                      className={cn(
                        'relative h-24 w-full rounded-xl border p-2 flex flex-col gap-0.5 transition-all text-left',
                        seleccionado && 'border-brand-azul bg-brand-azul/8 ring-1 ring-brand-azul',
                        !seleccionado && !disabled && 'hover:border-brand-azul/40 hover:bg-brand-azul/4 border-gray-200',
                        disabled && 'opacity-35 cursor-not-allowed bg-gray-50 border-gray-100',
                        isToday(dia) && !seleccionado && 'border-brand-rosa/50'
                      )}
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {format(dia, 'EEE', { locale: es })}
                      </span>
                      <span
                        className={cn(
                          'text-lg font-black leading-none',
                          seleccionado && 'text-brand-azul',
                          isToday(dia) && !seleccionado && 'text-brand-rosa',
                          !seleccionado && !isToday(dia) && 'text-gray-800'
                        )}
                      >
                        {format(dia, 'd')}
                      </span>
                      {disp && !disabled && (
                        <span className="text-[9px] text-green-600 font-semibold">
                          {disp.plazasDisponibles} pl.
                        </span>
                      )}
                      {disp && !disabled && (
                        <span className="text-[9px] font-bold text-brand-azul mt-auto">
                          {disp.tipoDia === 'SEMANA' ? 'S/25' : 'S/35'}
                        </span>
                      )}
                      {disabled && !pasado && disp?.tipoOcupacion === 'PRIVADO' && (
                        <Lock className="h-3 w-3 text-pink-400 mt-auto" />
                      )}
                      {disabled && !pasado && disp?.aforoCompleto && disp?.tipoOcupacion !== 'PRIVADO' && (
                        <span className="text-[9px] text-red-500 font-bold">Lleno</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {fechaSeleccionada && dispSeleccionada && (
            <div className="p-4 bg-brand-azul/5 border border-brand-azul/20 rounded-2xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-azul">
                Tu seleccion
              </p>
              <p className="font-bold text-gray-900">
                {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {dispSeleccionada.plazasDisponibles} plazas disponibles
                </span>
                <PrecioLabel tipoDia={dispSeleccionada.tipoDia} />
              </div>
              <button
                onClick={() => setPaso(2)}
                className="w-full py-2.5 bg-brand-azul text-white rounded-xl font-bold text-sm hover:bg-brand-azul/90 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-brand-azul" />
              Como funciona
            </p>
            <ol className="space-y-1.5 text-xs text-gray-500 list-none">
              {['Elige la fecha disponible', 'Completa los datos del niño', 'Selecciona como pagas', 'Recibe tu ticket en PDF'].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-brand-azul text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setPaso(1)}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900">Datos del visitante</h1>
              {fechaSeleccionada && (
                <p className="text-sm text-gray-500 capitalize">
                  {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(() => setPaso(3))} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-brand-azul text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                Datos del nino
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Nombre completo del niño <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Valentina Garcia"
                  className={cn('h-11 rounded-xl', errors.nombreNino && 'border-red-400')}
                  {...register('nombreNino')}
                />
                {errors.nombreNino && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.nombreNino.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Edad del niño <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={17}
                  placeholder="5"
                  className={cn('h-11 rounded-xl', errors.edadNino && 'border-red-400')}
                  {...register('edadNino', { valueAsNumber: true })}
                />
                {errors.edadNino && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.edadNino.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-brand-azul text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                Acompanante adulto responsable
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Tu nombre completo"
                  className={cn('h-11 rounded-xl', errors.nombreAcompanante && 'border-red-400')}
                  {...register('nombreAcompanante')}
                />
                {errors.nombreAcompanante && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.nombreAcompanante.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  DNI <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="12345678"
                  maxLength={8}
                  className={cn('h-11 rounded-xl', errors.dniAcompanante && 'border-red-400')}
                  {...register('dniAcompanante')}
                />
                <p className="text-[10px] text-gray-400">8 digitos numericos</p>
                {errors.dniAcompanante && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.dniAcompanante.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Compromisos obligatorios
              </h3>

              <div className="space-y-1.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Controller
                    name="aceptaReglamento"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="reglamento"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <span className="text-sm text-gray-800 leading-relaxed">
                    He leido y acepto el{' '}
                    <a
                      href="/legal/reglamento"
                      target="_blank"
                      className="text-brand-azul underline font-semibold"
                    >
                      Reglamento del local
                    </a>
                    , incluyendo las normas de conducta, restricciones de edad y
                    responsabilidades del acompanante adulto.
                    <span className="text-red-500 font-bold"> *</span>
                  </span>
                </label>
                {errors.aceptaReglamento && (
                  <p className="flex items-center gap-1 text-xs text-red-600 ml-7">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.aceptaReglamento.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Controller
                    name="conoceActa"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="acta"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <span className="text-sm text-gray-800 leading-relaxed">
                    Entiendo que debo firmar el{' '}
                    <a
                      href="/legal/acta-responsabilidad"
                      target="_blank"
                      className="text-brand-azul underline font-semibold"
                    >
                      Acta de Responsabilidad
                    </a>{' '}
                    fisicamente en recepcion antes de que el nino ingrese al local.
                    <span className="text-red-500 font-bold"> *</span>
                  </span>
                </label>
                {errors.conoceActa && (
                  <p className="flex items-center gap-1 text-xs text-red-600 ml-7">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.conoceActa.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {fechaSeleccionada && dispSeleccionada && (
                <p className="text-sm text-gray-500">
                  Total:{' '}
                  <PrecioLabel tipoDia={dispSeleccionada.tipoDia} />
                </p>
              )}
              <Button
                type="submit"
                className="ml-auto bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl px-6"
              >
                Continuar al pago
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setPaso(2)}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-black text-gray-900">Metodo de pago</h1>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Resumen de tu reserva
            </p>
            {fechaSeleccionada && (
              <p className="font-black text-gray-900">
                {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM yyyy", { locale: es })}
              </p>
            )}
            <p className="text-sm text-gray-600">Nino: {getValues('nombreNino')}</p>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="text-sm text-gray-500">Total a pagar</span>
              <PrecioLabel tipoDia={dispSeleccionada?.tipoDia} />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMetodoPago('YAPE')}
              className={cn(
                'w-full p-4 rounded-2xl border-2 text-left transition-all bg-white',
                metodoPago === 'YAPE'
                  ? 'border-[#6E2FEC] bg-[#6E2FEC]/5'
                  : 'border-gray-200 hover:border-[#6E2FEC]/40'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6E2FEC] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">Y</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Pagar con Yape</p>
                  <p className="text-xs text-gray-500">Transaccion instantanea</p>
                </div>
              </div>
            </button>

            {metodoPago === 'YAPE' && (
              <div className="p-4 bg-[#6E2FEC]/5 border border-[#6E2FEC]/20 rounded-xl space-y-3">
                <p className="text-sm font-bold text-gray-900">Instrucciones:</p>
                <ol className="text-sm text-gray-700 space-y-1.5 list-decimal list-inside">
                  <li>Abre Yape en tu telefono</li>
                  <li>Busca el numero del local</li>
                  <li>
                    Envía exactamente{' '}
                    <strong className="text-[#6E2FEC]">
                      <PrecioLabel tipoDia={dispSeleccionada?.tipoDia} />
                    </strong>
                  </li>
                  <li>Escribe tu nombre como concepto</li>
                  <li>Sube la captura del comprobante aqui</li>
                </ol>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700">
                    Comprobante Yape <span className="text-red-500">*</span>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#6E2FEC]/10 file:text-[#6E2FEC] hover:file:bg-[#6E2FEC]/20 cursor-pointer"
                    onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
                  />
                  {intentoEnvio && !comprobante && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Debes subir la captura del comprobante Yape
                    </p>
                  )}
                  {comprobante && (
                    <p className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {comprobante.name} &middot; {(comprobante.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700">
                    Codigo de operacion Yape (opcional)
                  </p>
                  <Input
                    placeholder="123456789"
                    value={codigoYape}
                    onChange={(e) => setCodigoYape(e.target.value)}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMetodoPago('CAJA')}
              className={cn(
                'w-full p-4 rounded-2xl border-2 text-left transition-all bg-white',
                metodoPago === 'CAJA'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Pagar en caja el dia del evento</p>
                  <p className="text-xs text-gray-500">El cupo queda apartado &middot; Pago al llegar</p>
                </div>
              </div>
            </button>

            {metodoPago === 'CAJA' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Importante:</strong> El cupo queda reservado, pero el ingreso al local
                  solo se confirma al pagar en caja. Te recomendamos llegar 10 minutos antes.
                </p>
              </div>
            )}

            {intentoEnvio && !metodoPago && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Selecciona un metodo de pago para continuar
              </p>
            )}
          </div>

          <button
            onClick={confirmarReserva}
            disabled={crear.isPending}
            className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {crear.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4" />
                Confirmar reserva
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
