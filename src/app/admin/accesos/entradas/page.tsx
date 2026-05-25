'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, isWeekend } from 'date-fns'
import jsQR from 'jsqr'
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Search,
  User,
  CalendarDays,
  Ticket,
  CreditCard,
  LogIn,
  Ban,
  UserCheck,
  ChevronLeft,
  Banknote,
  Smartphone,
  Receipt,
} from 'lucide-react'

import { reservaService } from '@/services/reserva.service'
import { clienteService } from '@/services/cliente.service'
import { Reserva } from '@/types/reserva.types'
import { Cliente } from '@/types/cliente.types'
import { useAuth } from '@/hooks/useAuth'
import { RESERVAS_ADM_KEY, METRICAS_KEY } from '@/hooks/useReservas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Checkbox } from '@/components/ui/Checkbox'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

const ID_CLIENTE_MOSTRADOR = 1

type ScanState = 'idle' | 'scanning' | 'loading' | 'done'

function DatosTicket({ reserva }: { reserva: Reserva }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Ticket</span>
        <span className="font-mono font-bold text-brand-azul">{reserva.numeroTicket}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Nino</span>
        <span className="font-semibold">{reserva.nombreNino} · {reserva.edadNino} anos</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Acompanante</span>
        <span className="font-semibold">{reserva.nombreAcompanante}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Fecha</span>
        <span className="font-semibold">{formatDate(reserva.fechaEvento)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Total</span>
        <span className="font-bold text-green-700">{formatCurrency(reserva.totalPagado)}</span>
      </div>
    </div>
  )
}

interface ResultadoProps {
  reserva: Reserva | null
  error: string | null
  onReset: () => void
  onConfirmarIngreso: (id: number) => void
  onConfirmarPago: (id: number) => void
  loadingIngreso: boolean
  loadingPago: boolean
}

function ResultadoEscaneo({
  reserva, error, onReset, onConfirmarIngreso, onConfirmarPago,
  loadingIngreso, loadingPago,
}: ResultadoProps) {
  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 text-center space-y-2">
          <XCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="font-bold text-red-700">Ticket no encontrado</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <Button variant="outline" onClick={onReset} className="w-full rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  if (!reserva) return null

  const yaIngreso     = reserva.ingresado
  const pendientePago = reserva.estado === 'PENDIENTE'
  const invalido      = ['CANCELADA', 'REPROGRAMADA'].includes(reserva.estado)

  if (invalido) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-5 space-y-2">
          <Ban className="h-6 w-6 text-red-700" />
          <p className="font-black text-red-900 text-lg">Ticket invalido</p>
          <DatosTicket reserva={reserva} />
          <p className="text-sm text-red-700">Estado: <strong>{reserva.estado}</strong></p>
        </div>
        <Button variant="outline" onClick={onReset} className="w-full rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Escanear otro
        </Button>
      </div>
    )
  }

  if (yaIngreso) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-600" />
            <p className="font-black text-red-800 text-lg">Ya fue escaneado</p>
          </div>
          <DatosTicket reserva={reserva} />
          {reserva.fechaIngreso && (
            <p className="text-sm text-red-700">
              Ingreso registrado: <strong>{new Date(reserva.fechaIngreso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</strong>
            </p>
          )}
        </div>
        <Button variant="outline" onClick={onReset} className="w-full rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Escanear otro
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <p className="font-black text-green-800 text-lg">
            {pendientePago ? 'Ticket valido — pago pendiente' : 'Ticket valido'}
          </p>
        </div>
        <DatosTicket reserva={reserva} />
        {pendientePago && reserva.medioPago === 'YAPE' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Pago Yape pendiente de validacion.</strong>
            {reserva.referenciaPago
              ? ` Referencia: ${reserva.referenciaPago}`
              : ' Sin comprobante adjunto.'}
          </div>
        )}
        {pendientePago && reserva.medioPago === 'CAJA' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Pago en caja pendiente.</strong> Cobrar{' '}
            {formatCurrency(reserva.totalPagado)} antes de confirmar ingreso.
          </div>
        )}
        <div className="flex gap-3">
          {pendientePago && (
            <Button
              onClick={() => onConfirmarPago(reserva.id)}
              disabled={loadingPago}
              variant="outline"
              className="flex-1 rounded-xl border-amber-400 text-amber-700 hover:bg-amber-50 gap-1.5"
            >
              {loadingPago
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CreditCard className="h-4 w-4" />}
              Confirmar pago
            </Button>
          )}
          <Button
            onClick={() => onConfirmarIngreso(reserva.id)}
            disabled={loadingIngreso}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 gap-1.5 h-12"
          >
            {loadingIngreso
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <LogIn className="h-5 w-5" />}
            Confirmar ingreso
          </Button>
        </div>
      </div>
      <Button variant="outline" onClick={onReset} className="w-full rounded-full gap-2">
        <RotateCcw className="h-4 w-4" />
        Escanear otro
      </Button>
    </div>
  )
}

function TabEscaner() {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  const [codigo,       setCodigo]       = useState('')
  const [scanState,    setScanState]    = useState<ScanState>('idle')
  const [reserva,      setReserva]      = useState<Reserva | null>(null)
  const [scanError,    setScanError]    = useState<string | null>(null)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [camaraError,  setCamaraError]  = useState<string | null>(null)

  const confirmarIngreso = useMutation({
    mutationFn: (id: number) => reservaService.confirmarIngreso(id),
    onSuccess: (r) => setReserva(r),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo confirmar el ingreso.'),
  })

  const confirmarPago = useMutation({
    mutationFn: (id: number) => reservaService.confirmarPago(id),
    onSuccess: (r) => setReserva(r),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo confirmar el pago.'),
  })

  const handleTicket = useCallback(async (raw: string) => {
    const txt = raw.trim()
    if (!txt) return
    setScanState('loading')
    setScanError(null)
    setReserva(null)
    try {
      const esId = /^\d+$/.test(txt)
      const r = esId
        ? await reservaService.obtenerPorId(Number(txt))
        : await reservaService.obtenerPorTicket(txt)
      setReserva(r)
    } catch {
      setScanError('Ticket no encontrado o invalido.')
    } finally {
      setScanState('done')
    }
  }, [])

  const scanFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      stopCamera()
      handleTicket(code.data)
      return
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [handleTicket])

  const startCamera = useCallback(async () => {
    setCamaraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCamaraActiva(true)
      setScanState('scanning')
      setReserva(null)
      setScanError(null)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setCamaraError('No se pudo acceder a la camara. Verifica los permisos.')
    }
  }, [scanFrame])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCamaraActiva(false)
  }, [])

  const reset = useCallback(() => {
    setScanState('idle')
    setReserva(null)
    setScanError(null)
    setCodigo('')
  }, [])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  const isDone = scanState === 'done'

  return (
    <div className="space-y-5">
      {isDone ? (
        <ResultadoEscaneo
          reserva={reserva}
          error={scanError}
          onReset={reset}
          onConfirmarIngreso={(id) => confirmarIngreso.mutate(id)}
          onConfirmarPago={(id) => confirmarPago.mutate(id)}
          loadingIngreso={confirmarIngreso.isPending}
          loadingPago={confirmarPago.isPending}
        />
      ) : scanState === 'loading' ? (
        <Card className="border border-brand-azul/20 rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-brand-azul animate-spin" />
            <p className="text-sm font-semibold text-gray-700">Verificando ticket...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="relative bg-gray-900 aspect-square max-w-xs mx-auto flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${camaraActiva ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              {!camaraActiva && (
                <div className="flex flex-col items-center gap-3 text-white/60">
                  {camaraError ? (
                    <>
                      <CameraOff className="h-12 w-12" />
                      <p className="text-sm text-center px-4">{camaraError}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-12 w-12" />
                      <p className="text-sm">Camara desactivada</p>
                    </>
                  )}
                </div>
              )}
              {camaraActiva && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 relative">
                    <span className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-brand-azul rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-brand-azul rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-brand-azul rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-brand-azul rounded-br-lg" />
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-4 flex gap-2">
              {!camaraActiva ? (
                <Button
                  onClick={startCamera}
                  className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Activar camara
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 rounded-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <CameraOff className="h-4 w-4" />
                  Detener camara
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400 font-semibold shrink-0">o ingreso manual</span>
            <Separator className="flex-1" />
          </div>

          <Card className="border border-gray-100 rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-sm font-semibold">Codigo de ticket o ID</Label>
              <div className="flex gap-2">
                <Input
                  value={codigo}
                  onChange={e => setCodigo(e.target.value)}
                  placeholder="TKT-1-20260601-0001 o ID numerico"
                  className="font-mono rounded-xl h-11 flex-1"
                  onKeyDown={e => e.key === 'Enter' && codigo.trim() && handleTicket(codigo)}
                />
                <Button
                  onClick={() => handleTicket(codigo)}
                  disabled={!codigo.trim()}
                  className="rounded-xl h-11 px-4 shrink-0 bg-brand-azul hover:bg-brand-azul/90 text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Ingresa el numero de ticket (TKT-...) o el ID numerico de la reserva.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

const ventaSchema = z.object({
  nombreNino:        z.string().min(2, 'Minimo 2 caracteres').max(120),
  edadNino:          z.coerce.number({ invalid_type_error: 'Ingresa la edad' }).min(0).max(17),
  nombreAcompanante: z.string().min(2, 'Minimo 2 caracteres').max(120),
  dniAcompanante:    z.string().length(8, 'Exactamente 8 digitos').regex(/^\d{8}$/, 'Solo numeros'),
  medioPago:         z.enum(['CAJA', 'YAPE'], {
    errorMap: () => ({ message: 'Selecciona el metodo de pago' }),
  }),
  firmaron:          z.literal(true, {
    errorMap: () => ({ message: 'Confirma que firmaron el acta de responsabilidad' }),
  }),
})

type VentaFormValues = z.infer<typeof ventaSchema>

const METODOS_PAGO: {
  value: 'CAJA' | 'YAPE'
  label: string
  sub: string
  Icon: React.ElementType
  activeClass: string
  iconClass: string
  textClass: string
  subClass: string
}[] = [
  {
    value:       'CAJA',
    label:       'Efectivo',
    sub:         'Pago en caja',
    Icon:        Banknote,
    activeClass: 'border-green-500 bg-green-50',
    iconClass:   'text-green-600',
    textClass:   'text-green-800',
    subClass:    'text-green-600',
  },
  {
    value:       'YAPE',
    label:       'Yape',
    sub:         'Pago con QR',
    Icon:        Smartphone,
    activeClass: 'border-purple-500 bg-purple-50',
    iconClass:   'text-purple-600',
    textClass:   'text-purple-800',
    subClass:    'text-purple-600',
  },
]

interface ResumenVentaProps {
  valores: Partial<VentaFormValues & { edadNino: unknown }>
  cliente: Cliente | null
  precioHoy: number
}

function ResumenVenta({ valores, cliente, precioHoy }: ResumenVentaProps) {
  const edadNum   = Number(valores.edadNino)
  const edadTexto = !isNaN(edadNum) && valores.edadNino !== '' && valores.edadNino !== undefined
    ? `${edadNum} a` : null

  const medioPagoTexto =
    valores.medioPago === 'YAPE' ? 'Yape' :
    valores.medioPago === 'CAJA' ? 'Efectivo' : null

  const filas = [
    {
      key:   'fecha',
      label: 'Fecha de entrada',
      icon:  <CalendarDays className="h-3 w-3" />,
      value: format(new Date(), 'dd/MM/yyyy'),
      ready: true,
    },
    {
      key:   'cliente',
      label: 'Cliente',
      icon:  <User className="h-3 w-3" />,
      value: cliente ? cliente.nombre : 'Visitante sin cuenta',
      ready: true,
      muted: !cliente,
    },
    {
      key:   'nino',
      label: 'Nino',
      icon:  null,
      value: valores.nombreNino
        ? `${valores.nombreNino}${edadTexto ? ` · ${edadTexto}` : ''}`
        : '—',
      ready: !!valores.nombreNino,
    },
    {
      key:   'acompanante',
      label: 'Acompanante',
      icon:  null,
      value: valores.nombreAcompanante || '—',
      ready: !!valores.nombreAcompanante,
    },
    {
      key:   'dni',
      label: 'DNI',
      icon:  null,
      value: (valores.dniAcompanante ?? '').length === 8 ? valores.dniAcompanante! : '—',
      ready: (valores.dniAcompanante ?? '').length === 8,
      mono:  true,
    },
    {
      key:     'pago',
      label:   'Metodo de pago',
      icon:    null,
      value:   medioPagoTexto ?? '—',
      ready:   !!medioPagoTexto,
      accent:  valores.medioPago === 'YAPE' ? 'purple' : valores.medioPago === 'CAJA' ? 'green' : null,
    },
  ]

  return (
    <div className="bg-gradient-to-br from-brand-azul/5 to-blue-50 border border-brand-azul/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-brand-azul" />
          <span className="text-sm font-bold text-brand-azul">Resumen en tiempo real</span>
        </div>
        <span className="text-xl font-black text-green-700">{formatCurrency(precioHoy)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {filas.map(({ key, label, icon, value, ready, muted, mono, accent }) => (
          <div key={key} className="bg-white/70 rounded-xl p-2.5 space-y-0.5">
            <p className="text-gray-400 flex items-center gap-1">
              {icon}
              {label}
            </p>
            <p
              className={cn(
                'font-bold truncate',
                mono && 'font-mono',
                !ready || muted
                  ? 'text-gray-300'
                  : accent === 'purple'
                    ? 'text-purple-700'
                    : accent === 'green'
                      ? 'text-green-700'
                      : 'text-gray-900'
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <Separator className="opacity-30" />

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {isWeekend(new Date()) ? 'Precio fin de semana' : 'Precio entre semana'}
        </span>
        <span className="text-2xl font-black text-green-700">{formatCurrency(precioHoy)}</span>
      </div>
    </div>
  )
}

function TabVentaPresencial() {
  const { idSede } = useAuth()
  const qc = useQueryClient()

  const [paso,              setPaso]              = useState<1 | 2 | 3>(1)
  const [clienteRegistrado, setClienteRegistrado] = useState<boolean | null>(null)
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)
  const [emailBusqueda,     setEmailBusqueda]     = useState('')
  const [buscandoCliente,   setBuscandoCliente]   = useState(false)
  const [ticketGenerado,    setTicketGenerado]    = useState<Reserva | null>(null)

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<VentaFormValues>({ resolver: zodResolver(ventaSchema) })

  const watchedValues = useWatch({ control })

  const precioHoy = isWeekend(new Date()) ? 35 : 25

  const crearVenta = useMutation({
    mutationFn: async (valores: VentaFormValues) => {
      const idCliente = clienteEncontrado?.id ?? ID_CLIENTE_MOSTRADOR
      const reserva = await reservaService.crear(idCliente, idSede!, {
        canalReserva:        'PRESENCIAL',
        fechaEvento:         format(new Date(), 'yyyy-MM-dd'),
        nombreNino:          valores.nombreNino,
        edadNino:            valores.edadNino,
        nombreAcompanante:   valores.nombreAcompanante,
        dniAcompanante:      valores.dniAcompanante,
        firmoConsentimiento: true,
        medioPago:           valores.medioPago,
      })
      await reservaService.confirmarPago(reserva.id)
      await reservaService.confirmarIngreso(reserva.id)
      return reserva
    },
    onSuccess: (reserva) => {
      setTicketGenerado(reserva)
      qc.invalidateQueries({ queryKey: [RESERVAS_ADM_KEY] })
      qc.invalidateQueries({ queryKey: [METRICAS_KEY] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo registrar la venta.'),
  })

  async function buscarCliente() {
    if (!emailBusqueda.trim()) return
    setBuscandoCliente(true)
    try {
      const cliente = await clienteService.buscarPorCorreo(emailBusqueda.trim())
      if (cliente) {
        setClienteEncontrado(cliente)
      } else {
        toast.error('No se encontro ningun cliente con ese correo.')
        setClienteEncontrado(null)
      }
    } catch {
      toast.error('Error al buscar el cliente.')
    } finally {
      setBuscandoCliente(false)
    }
  }

  function nuevaVenta() {
    setTicketGenerado(null)
    setClienteEncontrado(null)
    setClienteRegistrado(null)
    setEmailBusqueda('')
    setPaso(1)
    reset()
  }

  if (ticketGenerado) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 space-y-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
        <div>
          <p className="font-black text-green-800 text-xl">Entrada registrada</p>
          <p className="font-mono font-bold text-brand-azul text-lg mt-1">
            {ticketGenerado.numeroTicket}
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticketGenerado.numeroTicket)}`}
            alt="QR ticket"
            className="rounded-xl border border-gray-200"
            width={120}
            height={120}
          />
        </div>
        <p className="text-sm text-green-700">
          {clienteEncontrado
            ? `Entrada asociada a la cuenta de ${clienteEncontrado.nombre}.`
            : 'Entrada registrada como visitante sin cuenta.'}
        </p>
        <Button onClick={nuevaVenta} className="w-full rounded-xl">
          Nueva venta
        </Button>
      </div>
    )
  }

  if (paso === 1) {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-azul/10 rounded-2xl flex items-center justify-center mx-auto">
            <UserCheck className="h-7 w-7 text-brand-azul" />
          </div>
          <h3 className="font-black text-gray-900 text-lg">Nueva venta presencial</h3>
          <p className="text-sm text-gray-500">
            El cliente tiene cuenta registrada en Kiki y Lala?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setClienteRegistrado(true); setPaso(2) }}
            className="p-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:border-green-400 transition-all text-center space-y-2"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
            <p className="font-bold text-green-800">Si, tiene cuenta</p>
            <p className="text-xs text-green-700">Buscar por correo</p>
          </button>
          <button
            onClick={() => { setClienteRegistrado(false); setPaso(3) }}
            className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-gray-400 transition-all text-center space-y-2"
          >
            <User className="h-8 w-8 text-gray-500 mx-auto" />
            <p className="font-bold text-gray-700">No, es visitante</p>
            <p className="text-xs text-gray-500">Ingresar datos</p>
          </button>
        </div>
      </div>
    )
  }

  if (paso === 2 && clienteRegistrado) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPaso(1)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Volver
        </button>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Correo del cliente
          </Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={emailBusqueda}
              onChange={e => setEmailBusqueda(e.target.value)}
              className="h-11 rounded-xl flex-1"
              onKeyDown={e => e.key === 'Enter' && buscarCliente()}
            />
            <Button
              onClick={buscarCliente}
              disabled={!emailBusqueda.trim() || buscandoCliente}
              className="rounded-xl h-11 px-4 shrink-0"
            >
              {buscandoCliente
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Si no lo encuentra, puede continuar sin asociar a una cuenta.
          </p>
        </div>
        {clienteEncontrado && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-green-800">{clienteEncontrado.nombre}</p>
              <p className="text-xs text-green-700">{clienteEncontrado.correo}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        )}
        <Button
          onClick={() => setPaso(3)}
          disabled={!clienteEncontrado}
          className="w-full rounded-xl h-11"
        >
          Continuar con este cliente
        </Button>
        <button
          onClick={() => { setClienteRegistrado(false); setPaso(3) }}
          className="w-full text-xs text-gray-400 hover:text-gray-600 py-2"
        >
          No encontre la cuenta, continuar sin asociar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(v => crearVenta.mutate(v))} className="space-y-4">
      <button
        type="button"
        onClick={() => setPaso(clienteRegistrado ? 2 : 1)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Volver
      </button>

      <ResumenVenta
        valores={watchedValues}
        cliente={clienteEncontrado}
        precioHoy={precioHoy}
      />

      {clienteEncontrado && (
        <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-xl p-3 flex items-center gap-2">
          <User className="h-4 w-4 text-brand-azul shrink-0" />
          <div>
            <p className="text-xs font-bold text-brand-azul">Cliente: {clienteEncontrado.nombre}</p>
            <p className="text-xs text-gray-500">{clienteEncontrado.correo}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre del niño *</Label>
          <Input {...register('nombreNino')} placeholder="Maria Garcia" className="rounded-xl" />
          {errors.nombreNino && <p className="text-xs text-red-500">{errors.nombreNino.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Edad (años) *</Label>
          <Input type="number" min={0} max={17} {...register('edadNino')} placeholder="5" className="rounded-xl" />
          {errors.edadNino && <p className="text-xs text-red-500">{errors.edadNino.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Nombre del acompanante *</Label>
          <Input {...register('nombreAcompanante')} placeholder="Juan Garcia" className="rounded-xl" />
          {errors.nombreAcompanante && <p className="text-xs text-red-500">{errors.nombreAcompanante.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>DNI del acompanante *</Label>
          <Input {...register('dniAcompanante')} placeholder="12345678" maxLength={8} className="rounded-xl" />
          {errors.dniAcompanante && <p className="text-xs text-red-500">{errors.dniAcompanante.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Metodo de pago *
        </Label>
        <Controller
          name="medioPago"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {METODOS_PAGO.map(({ value, label, sub, Icon, activeClass, iconClass, textClass, subClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all space-y-1',
                    field.value === value
                      ? activeClass
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      field.value === value ? iconClass : 'text-gray-400'
                    )}
                  />
                  <p
                    className={cn(
                      'font-bold text-sm',
                      field.value === value ? textClass : 'text-gray-700'
                    )}
                  >
                    {label}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      field.value === value ? subClass : 'text-gray-400'
                    )}
                  >
                    {sub}
                  </p>
                </button>
              ))}
            </div>
          )}
        />
        {errors.medioPago && <p className="text-xs text-red-500">{errors.medioPago.message}</p>}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <strong>Antes de confirmar:</strong> El cliente debe firmar el Acta de Responsabilidad en este mostrador.
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <Controller
          name="firmaron"
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={v => field.onChange(v === true ? true : undefined)}
            />
          )}
        />
        <span className="text-sm text-gray-800">
          Confirmo que el acompanante firmo el Acta de Responsabilidad
          <span className="text-destructive font-bold"> *</span>
        </span>
      </label>
      {errors.firmaron && <p className="text-xs text-red-500">{errors.firmaron.message}</p>}

      <Button
        type="submit"
        disabled={crearVenta.isPending || !idSede}
        className="w-full rounded-xl h-12 gap-2 bg-brand-azul hover:bg-brand-azul/90 text-white"
      >
        {crearVenta.isPending
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <Ticket className="h-5 w-5" />}
        Generar ticket y registrar ingreso
      </Button>
    </form>
  )
}

export default function AccesosPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Control de acceso</h1>
        <p className="text-sm text-gray-400 mt-0.5">Escaneo de tickets y venta presencial</p>
      </div>

      <Tabs defaultValue="escaner">
        <TabsList className="bg-gray-100 rounded-xl h-10 w-full">
          <TabsTrigger value="escaner" className="flex-1 rounded-lg text-sm font-semibold gap-1.5">
            <QrCode className="h-4 w-4" />
            Escanear ticket
          </TabsTrigger>
          <TabsTrigger value="venta" className="flex-1 rounded-lg text-sm font-semibold gap-1.5">
            <Ticket className="h-4 w-4" />
            Venta presencial
          </TabsTrigger>
        </TabsList>
        <TabsContent value="escaner" className="mt-5">
          <TabEscaner />
        </TabsContent>
        <TabsContent value="venta" className="mt-5">
          <TabVentaPresencial />
        </TabsContent>
      </Tabs>
    </div>
  )
}
