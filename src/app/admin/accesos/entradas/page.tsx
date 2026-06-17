'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import jsQR from 'jsqr'
import {
  type LucideIcon,
  QrCode, Camera, CameraOff, CheckCircle2, XCircle, Loader2, RotateCcw,
  Search, User, Plus, X, AlertTriangle, LogIn, UserCheck, ChevronLeft,
  Calendar, CreditCard, Baby, FileText, Tag,
} from 'lucide-react'

import { ventaPresencialService } from '@/services/ventaPresencial.service'
import { clienteService } from '@/services/cliente.service'
import { Cliente } from '@/types/cliente.types'
import { MetodoPago, NinoVenta, PagoLinea, TicketDetalle, VentaMostradorResponse } from '@/types/ventaPresencial.types'
import { useAuth } from '@/hooks/useAuth'
import { usePromociones } from '@/hooks/usePromocion'
import { usePrecioDia, useRegistrarVenta, useMarcarEntrada, useEditarFechaTicket } from '@/hooks/useVentaPresencial'
import { RESERVAS_KEYS } from '@/features/admin/reservas/hooks/useReservasData'
import { useConfiguracionCalendario, useEdadMaxNino } from '@/hooks/useConfiguracion'
import { nombreField, fieldError, TipoDocumento, TIPOS_DOCUMENTO, documentoFieldPorTipo } from '@/lib/validations/campos'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Checkbox } from '@/components/ui/Checkbox'
import { Separator } from '@/components/ui/Separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

type ScanState = 'idle' | 'scanning' | 'loading' | 'done'

const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'EFECTIVO',      label: 'Efectivo' },
  { value: 'YAPE',          label: 'Yape' },
  { value: 'PLIN',          label: 'Plin' },
  { value: 'TARJETA',       label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
]

function FieldError({ message }: { message: string }) {
  return <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{message}</p>
}

function SectionCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function EstadoBadge({ estado, yaIngreso }: { estado: string; yaIngreso: boolean }) {
  if (yaIngreso)
    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Ya ingresó</span>
  if (estado === 'CONFIRMADA')
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Confirmada</span>
  if (estado === 'PENDIENTE')
    return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Pago pendiente</span>
  return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">{estado}</span>
}

function TicketDetalleCard({
  ticket, onReset, onMarcarEntrada, loadingEntrada,
}: {
  ticket: TicketDetalle
  onReset: () => void
  onMarcarEntrada: (id: number) => void
  loadingEntrada: boolean
}) {
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [nuevaFecha, setNuevaFecha]       = useState(format(new Date(), 'yyyy-MM-dd'))
  const editarFecha = useEditarFechaTicket()
  const qc = useQueryClient()

  const { idSede }     = useAuth()
  const { data: confCal } = useConfiguracionCalendario(idSede ?? null)
  const diasMaxFecha   = confCal?.diasMaxReservaPublica ?? 14

  const invalido = ['CANCELADA', 'REPROGRAMADA'].includes(ticket.estado)

  async function guardarFecha() {
    try {
      await editarFecha.mutateAsync({ idReserva: ticket.idReserva, nuevaFecha })
      toast.success('Fecha actualizada correctamente.')
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      setEditandoFecha(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la fecha.')
    }
  }

  if (invalido) {
    return (
      <div className="space-y-3">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm">Ticket inválido</span>
            </div>
            <p className="text-sm text-muted-foreground">Estado: <strong>{ticket.estado}</strong></p>
            <p className="font-mono text-xs text-muted-foreground">{ticket.numeroTicket}</p>
          </CardContent>
        </Card>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 h-10 border border-input rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Escanear otro ticket
        </button>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">{ticket.numeroTicket}</p>
          <EstadoBadge estado={ticket.estado} yaIngreso={ticket.yaIngreso} />
        </div>

        <Separator />

        <div className="space-y-2">
          {[
            { label: 'Niño',           valor: `${ticket.nombreNino} · ${ticket.edadNino} años` },
            { label: 'Fecha de visita', valor: formatDate(ticket.fechaVisita, "d 'de' MMMM yyyy") },
            { label: 'Acompañante',    valor: ticket.nombreAcompanante },
            { label: 'DNI',            valor: ticket.dniAcompanante },
            { label: 'Pago',           valor: `${formatCurrency(ticket.montoPagado)} · ${ticket.estadoPago}` },
          ].map(({ label, valor }) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-medium text-right">{valor}</span>
            </div>
          ))}
        </div>

        {!ticket.esHoy && !ticket.yaIngreso && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
            <p className="text-sm text-amber-800">
              Este ticket es para el <strong>{formatDate(ticket.fechaVisita, "d 'de' MMMM")}</strong>, no para hoy.
            </p>
            {!editandoFecha && (
              <button
                onClick={() => setEditandoFecha(true)}
                className="text-xs font-semibold text-amber-700 underline underline-offset-2"
              >
                Cambiar fecha
              </button>
            )}
          </div>
        )}

        {editandoFecha && (
          <div className="rounded-xl border border-input bg-muted/40 p-4 space-y-3">
            <Label className="text-sm font-medium">Nueva fecha de visita</Label>
            <Input
              type="date"
              value={nuevaFecha}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), diasMaxFecha), 'yyyy-MM-dd')}
              onChange={e => setNuevaFecha(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEditandoFecha(false)}
                className="h-9 border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFecha}
                disabled={editarFecha.isPending}
                className="h-9 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
              >
                {editarFecha.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        )}

        {ticket.yaIngreso ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-sm font-medium text-blue-800">Ingreso ya registrado.</p>
          </div>
        ) : ticket.estado === 'PENDIENTE' ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">Cobrar en caja antes de permitir el ingreso.</p>
          </div>
        ) : (
          <button
            onClick={() => onMarcarEntrada(ticket.idReserva)}
            disabled={loadingEntrada}
            className="w-full flex items-center justify-center gap-2 h-11 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {loadingEntrada ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Registrar ingreso
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 h-10 border border-input rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Escanear otro ticket
        </button>
      </CardContent>
    </Card>
  )
}

function TabEscaner() {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  const [codigo,       setCodigo]       = useState('')
  const [scanState,    setScanState]    = useState<ScanState>('idle')
  const [ticket,       setTicket]       = useState<TicketDetalle | null>(null)
  const [scanError,    setScanError]    = useState<string | null>(null)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [camaraError,  setCamaraError]  = useState<string | null>(null)

  const marcarEntrada = useMarcarEntrada()

  const handleTicket = useCallback(async (raw: string) => {
    const txt = raw.trim()
    if (!txt) return
    setScanState('loading')
    setScanError(null)
    setTicket(null)
    try {
      const detalle = await ventaPresencialService.buscarTicketDetalle(txt)
      setTicket(detalle)
    } catch {
      setScanError('Ticket no encontrado. Verifica el código e inténtalo de nuevo.')
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
      setTicket(null)
      setScanError(null)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setCamaraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
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
    setTicket(null)
    setScanError(null)
    setCodigo('')
  }, [])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  if (scanState === 'loading') {
    return (
      <Card>
        <CardContent className="p-10 flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Verificando ticket...</p>
        </CardContent>
      </Card>
    )
  }

  if (scanState === 'done' && scanError) {
    return (
      <div className="space-y-3">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 flex flex-col items-center gap-2 text-center">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="font-semibold text-destructive">Ticket no encontrado</p>
            <p className="text-sm text-muted-foreground">{scanError}</p>
          </CardContent>
        </Card>
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 h-10 border border-input rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (scanState === 'done' && ticket) {
    return (
      <TicketDetalleCard
        ticket={ticket}
        onReset={reset}
        onMarcarEntrada={id => {
          marcarEntrada.mutate(id, {
            onSuccess: updated => setTicket(updated),
            onError: (err: unknown) =>
              toast.error(err instanceof Error ? err.message : 'No se pudo registrar el ingreso.'),
          })
        }}
        loadingEntrada={marcarEntrada.isPending}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="relative bg-zinc-900 rounded-t-xl overflow-hidden aspect-square max-w-xs mx-auto flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn('w-full h-full object-cover', !camaraActiva && 'hidden')}
          />
          <canvas ref={canvasRef} className="hidden" />
          {!camaraActiva && (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              {camaraError
                ? (
                  <>
                    <CameraOff className="h-12 w-12" />
                    <p className="text-sm text-center px-6 text-zinc-300">{camaraError}</p>
                  </>
                ) : (
                  <>
                    <QrCode className="h-12 w-12" />
                    <p className="text-sm">Cámara desactivada</p>
                  </>
                )}
            </div>
          )}
          {camaraActiva && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 relative">
                <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-white rounded-tl" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-white rounded-tr" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-white rounded-bl" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-white rounded-br" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {camaraActiva ? (
            <button
              onClick={stopCamera}
              className="w-full flex items-center justify-center gap-2 h-10 border border-destructive/30 text-destructive hover:bg-destructive/5 rounded-lg text-sm font-medium transition-colors"
            >
              <CameraOff className="h-4 w-4" />
              Detener cámara
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
              Activar cámara
            </button>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium shrink-0">o ingresar manualmente</span>
        <Separator className="flex-1" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">Código de ticket</Label>
          <div className="flex gap-2">
            <Input
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="TKT-1-20260615-000001"
              className="font-mono flex-1"
              onKeyDown={e => e.key === 'Enter' && codigo.trim() && handleTicket(codigo)}
            />
            <button
              onClick={() => handleTicket(codigo)}
              disabled={!codigo.trim()}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TabVentaPresencial() {
  const { idSede }            = useAuth()
  const edadMax               = useEdadMaxNino()
  const { data: confCalVP }   = useConfiguracionCalendario(idSede ?? null)
  const diasMaxFecha          = confCalVP?.diasMaxReservaPublica ?? 14

  const [paso,              setPaso]              = useState<1 | 2 | 3>(1)
  const [clienteRegistrado, setClienteRegistrado] = useState<boolean | null>(null)
  const [cliente,           setCliente]           = useState<Cliente | null>(null)
  const [emailBusqueda,     setEmailBusqueda]     = useState('')
  const [buscandoCliente,   setBuscandoCliente]   = useState(false)

  const [fechaVisita,      setFechaVisita]      = useState(format(new Date(), 'yyyy-MM-dd'))
  const [ninos,            setNinos]            = useState<NinoVenta[]>([{ nombreNino: '', edadNino: 0 }])
  const [acompanante,      setAcompanante]      = useState({ nombre: '', dni: '', tipoDocumento: 'DNI' as TipoDocumento })
  const [idPromocion,      setIdPromocion]      = useState<number | null>(null)
  const [pagos,            setPagos]            = useState<PagoLinea[]>([{ medioPago: 'EFECTIVO', monto: 0 }])
  const [efectivoRecibido, setEfectivoRecibido] = useState(0)
  const [actaFirmada,      setActaFirmada]      = useState(false)
  const [ventaExitosa,     setVentaExitosa]     = useState<VentaMostradorResponse | null>(null)
  const [submitted,        setSubmitted]        = useState(false)
  const [tocados,          setTocados]          = useState<Set<string>>(new Set())

  const marcarTocado = (campo: string) => setTocados(prev => new Set([...prev, campo]))
  const verError     = (campo: string) => submitted || tocados.has(campo)

  const { data: precioDia }   = usePrecioDia(idSede ?? null, fechaVisita)
  const { data: promociones } = usePromociones()
  const registrar              = useRegistrarVenta()

  const promosActivas = (promociones ?? []).filter(p => p.activo)
  const precioUnit    = precioDia?.precio ?? 0
  const subtotal      = precioUnit * ninos.length

  const descuento = (() => {
    if (!idPromocion) return 0
    const promo = promosActivas.find(p => p.id === idPromocion)
    if (!promo) return 0
    if (promo.tipoPromocion === 'DESCUENTO_PORCENTAJE')
      return Math.min(subtotal, (subtotal * (promo.valorDescuento ?? 0)) / 100)
    if (promo.tipoPromocion === 'DESCUENTO_MONTO_FIJO' || promo.tipoPromocion === 'PAQUETE_GRUPAL')
      return Math.min(subtotal, promo.valorDescuento ?? 0)
    if (promo.tipoPromocion === 'ENTRADA_GRATUITA' || promo.tipoPromocion === 'CLIENTE_FRECUENTE')
      return subtotal
    return 0
  })()

  const total             = Math.max(0, subtotal - descuento)
  const esGratuito        = total === 0
  const sumaPagos         = pagos.reduce((s, p) => s + (p.monto || 0), 0)
  const efectivoAplicado  = pagos.filter(p => p.medioPago === 'EFECTIVO').reduce((s, p) => s + p.monto, 0)
  const tieneEfectivo     = pagos.some(p => p.medioPago === 'EFECTIVO' && p.monto > 0)
  const vuelto            = Math.max(0, efectivoRecibido - efectivoAplicado)
  const esAnticipada      = fechaVisita > format(new Date(), 'yyyy-MM-dd')

  const erroresNinos = ninos.map(n => ({
    nombre: fieldError(nombreField, n.nombreNino.trim()),
    edad: n.edadNino < 0 || n.edadNino > edadMax
      ? `La edad debe ser entre 0 y ${edadMax} años`
      : '',
  }))

  const erroresAcomp = {
    nombre: fieldError(nombreField, acompanante.nombre.trim()),
    dni:    fieldError(documentoFieldPorTipo(acompanante.tipoDocumento), acompanante.dni.trim()),
  }

  const todosNinosValidos  = erroresNinos.every(e => !e.nombre && !e.edad)
  const acompananteValido  = !erroresAcomp.nombre && !erroresAcomp.dni
  const pagosValidos       = esGratuito || (Math.abs(sumaPagos - total) < 0.01 && sumaPagos > 0)
  const efectivoOk         = !tieneEfectivo || efectivoRecibido >= efectivoAplicado
  const puedeRegistrar     = todosNinosValidos && acompananteValido && pagosValidos && efectivoOk && actaFirmada

  function actualizarNino(i: number, campo: keyof NinoVenta, valor: string | number) {
    setNinos(prev => prev.map((n, idx) => idx === i ? { ...n, [campo]: valor } : n))
  }
  function agregarNino() {
    setNinos(prev => [...prev, { nombreNino: '', edadNino: 0 }])
  }
  function quitarNino(i: number) {
    if (ninos.length === 1) return
    setNinos(prev => prev.filter((_, idx) => idx !== i))
  }
  function actualizarPago(i: number, campo: keyof PagoLinea, valor: string | number) {
    setPagos(prev => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p))
  }
  function agregarPago() {
    const usados   = new Set(pagos.map(p => p.medioPago))
    const siguiente = METODOS_PAGO.find(m => !usados.has(m.value))
    if (!siguiente) return
    setPagos(prev => [...prev, { medioPago: siguiente.value, monto: 0 }])
  }
  function quitarPago(i: number) {
    if (pagos.length === 1) return
    setPagos(prev => prev.filter((_, idx) => idx !== i))
  }

  async function buscarCliente() {
    if (!emailBusqueda.trim()) return
    setBuscandoCliente(true)
    try {
      const found = await clienteService.buscarPorCorreo(emailBusqueda.trim())
      if (found) setCliente(found)
      else { toast.error('No se encontró ningún cliente con ese correo.'); setCliente(null) }
    } catch {
      toast.error('Error al buscar el cliente.')
    } finally {
      setBuscandoCliente(false)
    }
  }

  function nuevaVenta() {
    setVentaExitosa(null); setCliente(null); setClienteRegistrado(null)
    setEmailBusqueda(''); setPaso(1)
    setFechaVisita(format(new Date(), 'yyyy-MM-dd'))
    setNinos([{ nombreNino: '', edadNino: 0 }])
    setAcompanante({ nombre: '', dni: '', tipoDocumento: 'DNI' })
    setIdPromocion(null); setPagos([{ medioPago: 'EFECTIVO', monto: 0 }])
    setEfectivoRecibido(0); setActaFirmada(false); setSubmitted(false); setTocados(new Set()); setTocados(new Set())
  }

  async function registrarVenta() {
    setSubmitted(true)
    if (!idSede || !puedeRegistrar) return
    try {
      const pagosPayload = esGratuito ? [] : pagos.filter(p => p.monto > 0)
      const result = await registrar.mutateAsync({
        tipoVenta: 'RESERVA',
        sedeId: idSede,
        clienteId: cliente?.id,
        fechaVisita,
        nombreAcompanante: acompanante.nombre,
        dniAcompanante: acompanante.dni,
        ninos,
        idPromocion: idPromocion ?? undefined,
        pagos: pagosPayload,
        efectivoRecibido: tieneEfectivo ? efectivoRecibido : undefined,
        actaFirmada: true,
      })
      if (!result) {
        toast.error('No se recibió respuesta del servidor. Intenta de nuevo.')
        return
      }
      setVentaExitosa(result)
      setSubmitted(false)
      const n = result.tickets?.length ?? 0
      toast.success(n > 1 ? `${n} tickets generados correctamente` : 'Ticket generado correctamente')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo registrar la venta.')
    }
  }

  if (ventaExitosa) {
    return (
      <div className="max-w-lg space-y-5">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-bold text-green-800 text-lg">
                {ventaExitosa.tickets.length > 1
                  ? `${ventaExitosa.tickets.length} tickets generados`
                  : 'Ticket generado exitosamente'}
              </p>
              <p className="text-sm text-green-700 mt-0.5">
                Total cobrado: <strong>{formatCurrency(ventaExitosa.total)}</strong>
              </p>
            </div>
            {ventaExitosa.vuelto > 0 && (
              <div className="inline-block rounded-xl bg-white border border-green-200 px-6 py-3">
                <p className="text-xs text-muted-foreground">Vuelto a entregar</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(ventaExitosa.vuelto)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {ventaExitosa.tickets.map(t => (
            <Card key={t.reservaId}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(t.numeroTicket)}`}
                  alt={`QR ${t.numeroTicket}`}
                  className="rounded-lg border border-input shrink-0"
                  width={80}
                  height={80}
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{t.nombreNino} · {t.edadNino} años</p>
                  <p className="font-mono text-xs text-primary mt-0.5">{t.numeroTicket}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(ventaExitosa.fechaVisita, "d 'de' MMMM yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <button
          onClick={nuevaVenta}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Nueva venta
        </button>
      </div>
    )
  }

  if (paso === 1) {
    return (
      <div className="max-w-sm space-y-6">
        <div>
          <h3 className="text-base font-semibold">Nueva venta presencial</h3>
          <p className="text-sm text-muted-foreground mt-0.5">¿El cliente tiene cuenta registrada en el sistema?</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setClienteRegistrado(true); setPaso(2) }}
            className="p-5 rounded-xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all text-left space-y-2.5"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Sí, tiene cuenta</p>
              <p className="text-xs text-muted-foreground mt-0.5">Buscar por correo</p>
            </div>
          </button>
          <button
            onClick={() => { setClienteRegistrado(false); setPaso(3) }}
            className="p-5 rounded-xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all text-left space-y-2.5"
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <User className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">No, es visitante</p>
              <p className="text-xs text-muted-foreground mt-0.5">Continuar sin cuenta</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  if (paso === 2 && clienteRegistrado) {
    return (
      <div className="max-w-sm space-y-5">
        <button
          onClick={() => setPaso(1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>
        <div>
          <h3 className="text-base font-semibold">Buscar cliente</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Ingresa el correo electrónico registrado</p>
        </div>
        <div className="space-y-1.5">
          <Label>Correo electrónico</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={emailBusqueda}
              onChange={e => setEmailBusqueda(e.target.value)}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && buscarCliente()}
            />
            <button
              onClick={buscarCliente}
              disabled={!emailBusqueda.trim() || buscandoCliente}
              className="h-9 px-3 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              {buscandoCliente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {cliente && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-green-800 text-sm">{cliente.nombreCompleto}</p>
                <p className="text-xs text-green-700 mt-0.5">{cliente.correo}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            </CardContent>
          </Card>
        )}
        <div className="space-y-2">
          <button
            onClick={() => setPaso(3)}
            disabled={!cliente}
            className="w-full h-10 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Continuar con este cliente
          </button>
          <button
            onClick={() => { setClienteRegistrado(false); setPaso(3) }}
            className="w-full h-9 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continuar sin asociar cliente
          </button>
        </div>
      </div>
    )
  }

  const ResumenPanel = () => (
    <Card className="border-primary/20">
      <CardContent className="p-5 space-y-4">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">Resumen de venta</p>

        {cliente && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
            <User className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium truncate">{cliente.nombreCompleto}</span>
          </div>
        )}

        <div className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-0.5">
          <p className="text-xs text-muted-foreground">Fecha de visita</p>
          <p className="text-sm font-semibold capitalize">
            {formatDate(fechaVisita, "EEEE d 'de' MMMM")}
          </p>
          {precioDia && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(precioDia.precio)} · {precioDia.esFindeSemanaOFeriado ? 'fin de semana / feriado' : 'entre semana'}
            </p>
          )}
        </div>

        {ninos.some(n => n.nombreNino.trim()) && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Niños</p>
            {ninos.filter(n => n.nombreNino.trim()).map((n, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{n.nombreNino}</span>
                <span className="text-muted-foreground shrink-0 ml-2">{n.edadNino} años</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({ninos.length} × {formatCurrency(precioUnit)})</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Descuento</span>
              <span className="font-medium text-green-600">− {formatCurrency(descuento)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-primary/20">
            <span className="font-bold text-primary">Total</span>
            <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {esGratuito && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-center">
            <p className="text-xs font-semibold text-green-700">Entrada gratuita</p>
          </div>
        )}

        {!esGratuito && pagos.some(p => p.monto > 0) && (
          <>
            <Separator />
            <div className="space-y-1.5">
              {pagos.filter(p => p.monto > 0).map((p, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {METODOS_PAGO.find(m => m.value === p.medioPago)?.label}
                  </span>
                  <span className="font-medium">{formatCurrency(p.monto)}</span>
                </div>
              ))}
              <div className={cn(
                'flex justify-between text-xs font-semibold pt-1 border-t border-input',
                pagosValidos ? 'text-green-600' : 'text-amber-600',
              )}>
                <span>Cubierto</span>
                <span>
                  {formatCurrency(sumaPagos)}
                  {!pagosValidos && ` — faltan ${formatCurrency(Math.max(0, total - sumaPagos))}`}
                </span>
              </div>
            </div>
          </>
        )}

        {vuelto > 0 && (
          <div className="flex justify-between items-center rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
            <span className="text-sm font-semibold text-green-800">Vuelto</span>
            <span className="text-base font-black text-green-700">{formatCurrency(vuelto)}</span>
          </div>
        )}

        {esAnticipada && (
          <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
            Compra anticipada — ticket confirmado para esa fecha.
          </p>
        )}
      </CardContent>
    </Card>
  )

  const tipoDocActivo = TIPOS_DOCUMENTO.find(t => t.value === acompanante.tipoDocumento)!

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">

      {/* ── Columna formulario ── */}
      <div className="space-y-3">

        {/* Barra superior: volver + cliente */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setPaso(clienteRegistrado ? 2 : 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </button>
          {cliente && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 min-w-0 flex-1">
              <User className="h-3 w-3 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary truncate">{cliente.nombreCompleto}</span>
              <span className="text-xs text-muted-foreground truncate hidden sm:block">{cliente.correo}</span>
            </div>
          )}
        </div>

        {/* Card único con todas las secciones divididas */}
        <Card className="overflow-hidden divide-y divide-border">

          {/* ── Fecha ── */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha de visita</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                type="date"
                value={fechaVisita}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), diasMaxFecha), 'yyyy-MM-dd')}
                onChange={e => setFechaVisita(e.target.value)}
                className="h-8 w-44 text-sm"
              />
              {precioDia && (
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{formatCurrency(precioDia.precio)}</strong> / niño ·{' '}
                  {precioDia.esFindeSemanaOFeriado ? 'fin de semana' : 'entre semana'}
                </span>
              )}
            </div>
          </div>

          {/* ── Niños ── */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Niños {ninos.length > 1 && <span className="text-primary">({ninos.length})</span>}
              </p>
              <button
                onClick={agregarNino}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" /> Agregar niño
              </button>
            </div>
            {ninos.map((nino, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Nombre del niño${ninos.length > 1 ? ` ${i + 1}` : ''}`}
                    value={nino.nombreNino}
                    onChange={e => actualizarNino(i, 'nombreNino', e.target.value.toUpperCase())}
                    onBlur={() => marcarTocado(`nino-${i}-nombre`)}
                    className={cn('flex-1 h-8 text-sm', verError(`nino-${i}-nombre`) && erroresNinos[i]?.nombre && 'border-destructive')}
                  />
                  <Input
                    type="number"
                    placeholder="Edad"
                    value={nino.edadNino || ''}
                    onChange={e => actualizarNino(i, 'edadNino', Number(e.target.value))}
                    onBlur={() => marcarTocado(`nino-${i}-edad`)}
                    min={0}
                    max={edadMax}
                    className={cn('w-16 h-8 text-sm', verError(`nino-${i}-edad`) && erroresNinos[i]?.edad && 'border-destructive')}
                  />
                  {ninos.length > 1 && (
                    <button
                      onClick={() => quitarNino(i)}
                      className="h-8 w-8 shrink-0 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {verError(`nino-${i}-nombre`) && erroresNinos[i]?.nombre && <FieldError message={erroresNinos[i].nombre} />}
                {verError(`nino-${i}-edad`)   && erroresNinos[i]?.edad   && <FieldError message={erroresNinos[i].edad} />}
              </div>
            ))}
          </div>

          {/* ── Acompañante ── */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acompañante</p>
            {/* Nombre */}
            <div>
              <Input
                placeholder="Nombre completo *"
                value={acompanante.nombre}
                onChange={e => setAcompanante(a => ({ ...a, nombre: e.target.value.toUpperCase() }))}
                onBlur={() => marcarTocado('acomp-nombre')}
                className={cn('h-8 text-sm', verError('acomp-nombre') && erroresAcomp.nombre && 'border-destructive')}
              />
              {verError('acomp-nombre') && erroresAcomp.nombre && <FieldError message={erroresAcomp.nombre} />}
            </div>
            {/* Tipo doc + número en una sola fila */}
            <div className="flex gap-2 items-start">
              <div className="flex gap-1 shrink-0">
                {TIPOS_DOCUMENTO.map(tipo => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => setAcompanante(a => ({ ...a, tipoDocumento: tipo.value, dni: '' }))}
                    className={cn(
                      'h-8 px-2.5 rounded-lg border text-xs font-semibold transition-colors',
                      acompanante.tipoDocumento === tipo.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 space-y-0.5">
                <Input
                  placeholder={tipoDocActivo.placeholder}
                  value={acompanante.dni}
                  onChange={e => {
                    const raw = e.target.value
                    const val = acompanante.tipoDocumento === 'EXTRANJERO'
                      ? raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      : raw.replace(/\D/g, '')
                    setAcompanante(a => ({ ...a, dni: val }))
                  }}
                  onBlur={() => marcarTocado('acomp-dni')}
                  maxLength={tipoDocActivo.maxLength}
                  className={cn('h-8 text-sm', verError('acomp-dni') && erroresAcomp.dni && 'border-destructive')}
                />
                <p className="text-xs text-muted-foreground">{tipoDocActivo.hint}</p>
                {verError('acomp-dni') && erroresAcomp.dni && <FieldError message={erroresAcomp.dni} />}
              </div>
            </div>
          </div>

          {/* ── Promoción ── */}
          {promosActivas.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Promoción</p>
              <Select
                value={idPromocion ? String(idPromocion) : 'ninguna'}
                onValueChange={v => setIdPromocion(v === 'ninguna' ? null : Number(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin promoción</SelectItem>
                  {promosActivas.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Forma de pago ── */}
          {!esGratuito && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forma de pago</p>

              {pagos.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Select
                    value={p.medioPago}
                    onValueChange={v => actualizarPago(i, 'medioPago', v as MetodoPago)}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METODOS_PAGO.filter(m =>
                        m.value === p.medioPago ||
                        !pagos.some((otro, j) => j !== i && otro.medioPago === m.value)
                      ).map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={p.monto || ''}
                    onChange={e => actualizarPago(i, 'monto', Number(e.target.value))}
                    className="flex-1 h-8 text-sm"
                  />
                  {pagos.length > 1 && (
                    <button
                      onClick={() => quitarPago(i)}
                      className="h-8 w-8 shrink-0 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between">
                {pagos.length < METODOS_PAGO.length ? (
                  <button
                    onClick={agregarPago}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Agregar método
                  </button>
                ) : <span />}
                {submitted && !pagosValidos && (
                  <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Faltan {formatCurrency(Math.max(0, total - sumaPagos))}
                  </p>
                )}
              </div>

              {/* Efectivo: ¿con cuánto paga? — compacto e inline */}
              {tieneEfectivo && (
                <div className="rounded-lg bg-muted/50 border border-input px-3 py-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">¿Con cuánto?</span>
                    {[10, 20, 50, 100, 200].map(bill => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => setEfectivoRecibido(bill)}
                        className={cn(
                          'h-6 px-2 rounded-md border text-xs font-semibold transition-colors',
                          efectivoRecibido === bill
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-input hover:bg-accent',
                        )}
                      >
                        S/{bill}
                      </button>
                    ))}
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={efectivoRecibido || ''}
                      onChange={e => setEfectivoRecibido(Number(e.target.value))}
                      className="h-6 w-20 text-right text-xs ml-auto"
                    />
                  </div>
                  {vuelto > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-green-700">
                      <span>Vuelto</span>
                      <span>{formatCurrency(vuelto)}</span>
                    </div>
                  )}
                  {submitted && !efectivoOk && (
                    <FieldError message="El monto entregado es insuficiente." />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Acta de responsabilidad ── */}
          <div className={cn('px-4 py-3', submitted && !actaFirmada && 'bg-destructive/5')}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={actaFirmada}
                onCheckedChange={v => setActaFirmada(v === true)}
                className="mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-medium leading-snug">
                  El acompañante firmó el Acta de Responsabilidad
                  <span className="text-destructive ml-0.5">*</span>
                </p>
                <p className="text-xs text-muted-foreground">Requerido antes de confirmar el ingreso.</p>
              </div>
            </label>
            {submitted && !actaFirmada && (
              <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Confirma que el acta fue firmada.
              </p>
            )}
          </div>
        </Card>

        {/* Resumen en móvil */}
        <div className="lg:hidden">
          <ResumenPanel />
        </div>

        {/* Botón generar */}
        <button
          onClick={registrarVenta}
          disabled={registrar.isPending || !idSede}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {registrar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {ninos.length > 1 ? `Generar ${ninos.length} tickets` : 'Generar ticket'}
        </button>
      </div>

      {/* ── Resumen lateral (desktop) ── */}
      <div className="hidden lg:block sticky top-20">
        <ResumenPanel />
      </div>
    </div>
  )
}

export default function AccesosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Control de acceso</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Escaneo de tickets y venta presencial en mostrador</p>
      </div>

      <Tabs defaultValue="escaner">
        <TabsList className="h-10">
          <TabsTrigger value="escaner" className="gap-1.5 text-sm">
            <QrCode className="h-4 w-4" />
            Escanear ticket
          </TabsTrigger>
          <TabsTrigger value="venta" className="gap-1.5 text-sm">
            <LogIn className="h-4 w-4" />
            Venta presencial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escaner" className="mt-5">
          <div className="max-w-sm">
            <TabEscaner />
          </div>
        </TabsContent>

        <TabsContent value="venta" className="mt-5">
          <TabVentaPresencial />
        </TabsContent>
      </Tabs>
    </div>
  )
}
