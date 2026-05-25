'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
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
} from 'lucide-react'

import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/types/reserva.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { StatusBadge } from '@/components/common/Statusbadge'
import { formatDate, formatCurrency } from '@/lib/utils'

type ScanState = 'idle' | 'scanning' | 'loading' | 'success' | 'error'

interface ScanResult {
  reserva?: Reserva
  message?: string
}

function ResultCard({ state, result }: { state: ScanState; result: ScanResult | null }) {
  if (state === 'loading') {
    return (
      <Card className="border border-brand-azul/20 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-azul animate-spin" />
          <p className="text-sm font-semibold text-gray-700">Verificando ticket...</p>
        </CardContent>
      </Card>
    )
  }

  if (state === 'success' && result?.reserva) {
    const r = result.reserva
    return (
      <Card className="border-2 border-green-400 rounded-2xl shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <p className="font-black text-green-700 text-lg">Ingreso confirmado</p>
              <p className="text-xs text-green-600">Ticket validado correctamente</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 col-span-2">
              <Ticket className="h-4 w-4 text-gray-400" />
              <span className="font-mono font-bold text-gray-900">{r.numeroTicket}</span>
              <StatusBadge status={r.estado} />
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Niño</p>
                <p className="font-semibold text-gray-900">{r.nombreNino} ({r.edadNino} años)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="font-semibold text-gray-900">{formatDate(r.fechaEvento)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Acompañante</p>
              <p className="font-semibold text-gray-900">{r.nombreAcompanante}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total pagado</p>
              <p className="font-semibold text-gray-900">{formatCurrency(r.totalPagado)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card className="border-2 border-red-300 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
          <XCircle className="h-10 w-10 text-red-500" />
          <div>
            <p className="font-bold text-red-700">No se pudo confirmar</p>
            <p className="text-sm text-red-500 mt-1">{result?.message ?? 'Ticket inválido o ya fue usado.'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

export default function EscanerQrPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')

  const confirmar = useMutation({
    mutationFn: (id: number) => reservaService.confirmarIngreso(id),
    onSuccess: (reserva) => {
      setScanState('success')
      setResult({ reserva })
    },
    onError: (err: { message?: string }) => {
      setScanState('error')
      setResult({ message: err?.message ?? 'No se pudo confirmar el ingreso.' })
    },
  })

  const handleTicket = useCallback(
    (codigoOrId: string) => {
      if (scanState === 'loading') return
      const id = parseInt(codigoOrId.trim())
      if (isNaN(id)) {
        setScanState('error')
        setResult({ message: `Código no reconocido: "${codigoOrId}"` })
        return
      }
      setScanState('loading')
      confirmar.mutate(id)
    },
    [scanState, confirmar]
  )

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
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
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
      setScanState('scanning')
      setResult(null)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }, [scanFrame])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
    if (scanState === 'scanning') setScanState('idle')
  }, [scanState])

  const resetScan = useCallback(() => {
    setScanState('idle')
    setResult(null)
    setManualInput('')
  }, [])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const isDone = scanState === 'success' || scanState === 'error'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Escáner de entradas</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Escanea el QR del ticket o ingresa el ID manualmente
        </p>
      </div>

      {(scanState === 'success' || scanState === 'error') && (
        <>
          <ResultCard state={scanState} result={result} />
          <Button
            onClick={resetScan}
            variant="outline"
            className="w-full rounded-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Escanear otro ticket
          </Button>
        </>
      )}

      {scanState === 'loading' && <ResultCard state="loading" result={null} />}

      {!isDone && scanState !== 'loading' && (
        <>
          <Card className="border border-gray-100 shadow-card rounded-2xl overflow-hidden">
            <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && (
                <div className="flex flex-col items-center gap-3 text-white/60">
                  {cameraError ? (
                    <>
                      <CameraOff className="h-12 w-12" />
                      <p className="text-sm text-center px-4">{cameraError}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-12 w-12" />
                      <p className="text-sm">Cámara desactivada</p>
                    </>
                  )}
                </div>
              )}

              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/80 rounded-2xl relative">
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-azul rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-azul rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-azul rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-azul rounded-br-lg" />
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 flex gap-2">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Activar cámara
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 rounded-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <CameraOff className="h-4 w-4" />
                  Detener cámara
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400 font-semibold shrink-0">o ingreso manual</span>
            <Separator className="flex-1" />
          </div>

          <Card className="border border-gray-100 shadow-card rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-sm font-semibold">ID de reserva</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ej: 1042"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualInput.trim()) {
                        handleTicket(manualInput)
                      }
                    }}
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
                <Button
                  onClick={() => handleTicket(manualInput)}
                  disabled={!manualInput.trim()}
                  className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl px-5"
                >
                  Confirmar
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Ingresa el ID numérico de la reserva para confirmar el ingreso.
              </p>
            </CardContent>
          </Card>

          {scanState === 'scanning' && (
            <div className="flex items-center justify-center gap-2 text-sm text-brand-azul font-semibold">
              <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 gap-1.5 animate-pulse">
                <Camera className="h-3.5 w-3.5" />
                Escaneando...
              </Badge>
            </div>
          )}
        </>
      )}
    </div>
  )
}
