'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import jsQR from 'jsqr'
import {
  QrCode, Camera, CameraOff, CheckCircle2, XCircle, Loader2, RotateCcw,
  Search, AlertTriangle, LogIn, 
} from 'lucide-react'

import { accesosApi } from '../../services/accesos.api'
import { TicketDetalle } from '../../types'
import { useAuth } from '@/hooks/useAuth'
import { useMarcarEntrada, useEditarFechaTicket } from '../../hooks/useAccesosData'
import { useConfiguracionCalendario } from '@/hooks/useConfiguracion'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

type ScanState = 'idle' | 'scanning' | 'loading' | 'done'

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

  const { idSede }     = useAuth()
  const { data: confCal } = useConfiguracionCalendario(idSede ?? null)
  const diasMaxFecha   = confCal?.diasMaxReservaPublica ?? 14

  const invalido = ['CANCELADA', 'REPROGRAMADA'].includes(ticket.estado)

  async function guardarFecha() {
    try {
      await editarFecha.mutateAsync({ idReserva: ticket.idReserva, nuevaFecha })
      toast.success('Fecha actualizada correctamente.')
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

export const AccesoPublicoView = () => {
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
      const detalle = await accesosApi.buscarTicketDetalle(txt)
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
      <div className="max-w-sm">
        <Card>
          <CardContent className="p-10 flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Verificando ticket...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (scanState === 'done' && scanError) {
    return (
      <div className="max-w-sm space-y-3">
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
      <div className="max-w-sm">
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
      </div>
    )
  }

  return (
    <div className="max-w-sm space-y-4">
      <Card>
        <div className="relative bg-zinc-900 rounded-t-xl overflow-hidden aspect-square flex items-center justify-center">
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
