'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  PartyPopper,
  ExternalLink,
  User,
} from 'lucide-react'
import { useConfirmarEvento } from '@/hooks/useEventos'
import { useGenerarContrato } from '@/hooks/useContratos'
import { EventoPrivado, ModalidadPago, PagoItem } from '@/types/evento.types'
import { PLANTILLAS, PlantillaId, aplicarPlantilla } from '@/types/contrato.types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MultiMedioPago } from '@/features/admin/eventos/components/forms/MultiMedioPago'
import { PlanCuotasBuilder, PlanCuotasValue } from '@/features/admin/eventos/components/forms/PlanCuotasBuilder'

type Paso = 1 | 2 | 3

interface Props {
  evento: EventoPrivado
  open: boolean
  onClose: () => void
}

const preciSchema = z
  .object({
    precioTotal: z.coerce
      .number('Ingresa un precio válido')
      .positive('El precio debe ser mayor a 0'),
    montoAdelanto: z.coerce
      .number('Ingresa un monto válido')
      .min(0, 'El adelanto no puede ser negativo'),
  })
  .refine((v) => v.montoAdelanto <= v.precioTotal, {
    message: 'El adelanto no puede superar el precio total',
    path: ['montoAdelanto'],
  })

type PrecioValues = z.infer<typeof preciSchema>

type PrecioData = PrecioValues & {
  pagosAdelanto: PagoItem[]
  modalidadPago: ModalidadPago
  numeroCuotas?: number
  fechaLimitePago?: string
}

const PASOS_LABELS: Record<Paso, string> = {
  1: 'Contactar',
  2: 'Precio',
  3: 'Contrato',
}

function StepIndicator({ paso }: { paso: Paso }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {([1, 2, 3] as Paso[]).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors',
              n < paso
                ? 'bg-green-500 text-white'
                : n === paso
                ? 'bg-brand-rosa text-white'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            {n < paso ? <CheckCircle2 className="h-4 w-4" /> : n}
          </div>
          <span
            className={cn(
              'text-xs font-semibold hidden sm:block',
              n === paso ? 'text-brand-rosa' : 'text-gray-400'
            )}
          >
            {PASOS_LABELS[n]}
          </span>
          {n < 3 && <div className="w-8 h-px bg-gray-200 hidden sm:block" />}
        </div>
      ))}
    </div>
  )
}

export function ConfirmarEventoModal({ evento, open, onClose }: Props) {
  const [paso, setPaso]                   = useState<Paso>(1)
  const [precioData, setPrecioData]       = useState<PrecioData | null>(null)
  const [pagosAdelanto, setPagosAdelanto] = useState<PagoItem[]>([{ medioPago: '', monto: 0 }])
  const [modalidadPago, setModalidadPago] = useState<ModalidadPago>('AL_CONTADO')
  const [planCuotas, setPlanCuotas]       = useState<PlanCuotasValue>({ numeroCuotas: 2, fechaLimitePago: '' })
  const [pagoError, setPagoError]                     = useState<string | null>(null)
  const [fechaLimitePagoContado, setFechaLimitePagoContado] = useState(evento.fechaEvento)
  const [plantillaId, setPlantillaId]     = useState<PlantillaId | ''>('')
  const [opcionContrato, setOpcionContrato] = useState<'plantilla' | 'manual' | 'omitir' | null>(null)
  const [contratoGenerado, setContratoGenerado] = useState(false)

  const confirmar       = useConfirmarEvento()
  const generarContrato = useGenerarContrato()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PrecioValues>({
    resolver: zodResolver(preciSchema),
    defaultValues: { precioTotal: 0, montoAdelanto: 0 },
  })

  useEffect(() => {
    if (open) {
      setPaso(1)
      setPrecioData(null)
      setPagosAdelanto([{ medioPago: '', monto: 0 }])
      setModalidadPago('AL_CONTADO')
      setPlanCuotas({ numeroCuotas: 2, fechaLimitePago: '' })
      setPagoError(null)
      setFechaLimitePagoContado(evento.fechaEvento)
      setPlantillaId('')
      setOpcionContrato(null)
      setContratoGenerado(false)
      reset({ precioTotal: 0, montoAdelanto: 0 })
    }
  }, [open, reset])

  const precioTotal   = watch('precioTotal') ?? 0
  const montoAdelanto = watch('montoAdelanto') ?? 0
  const saldo         = Math.max(0, precioTotal - montoAdelanto)

  const telefonoLimpio = evento.telefonoCliente?.replace(/\D/g, '') ?? null
  const whatsappCliente = telefonoLimpio
    ? `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(
        `Hola ${evento.nombreCliente}, me comunico en relación a su evento privado del ${formatDate(evento.fechaEvento)}. ¿Podemos coordinar los detalles finales?`
      )}`
    : null
  const mailtoCliente = evento.correoCliente
    ? `mailto:${evento.correoCliente}?subject=Evento privado - ${formatDate(evento.fechaEvento)}&body=Hola ${evento.nombreCliente},%0D%0A%0D%0AMe comunico en relación a su evento privado del ${formatDate(evento.fechaEvento)}.`
    : null

  const textoContrato = plantillaId
    ? aplicarPlantilla(PLANTILLAS[plantillaId].plantilla, {
        nombreCliente:       evento.nombreCliente,
        tipoEvento:          evento.tipoEvento,
        fechaEvento:         evento.fechaEvento,
        turno:               evento.turno,
        aforoDeclarado:      evento.aforoDeclarado,
        precioTotalContrato: precioData?.precioTotal,
        montoAdelanto:       precioData?.montoAdelanto,
        saldoPendiente:      precioData
          ? precioData.precioTotal - precioData.montoAdelanto
          : undefined,
      })
    : ''

  function onPrecioSubmit(values: PrecioValues) {
    if (values.montoAdelanto > 0) {
      const allValid = pagosAdelanto.every((p) => p.medioPago && p.monto > 0)
      if (!allValid) {
        setPagoError('Completa todos los medios de pago y sus montos.')
        return
      }
      const sumaTotal = pagosAdelanto.reduce((acc, p) => acc + p.monto, 0)
      if (Math.abs(sumaTotal - values.montoAdelanto) >= 0.01) {
        setPagoError(
          `La suma de los medios (${formatCurrency(sumaTotal)}) debe coincidir con el adelanto (${formatCurrency(values.montoAdelanto)}).`
        )
        return
      }
    }

    if (modalidadPago === 'AL_CONTADO') {
      if (!fechaLimitePagoContado) {
        setPagoError('Define la fecha límite de pago del saldo.')
        return
      }
      if (new Date(fechaLimitePagoContado) > new Date(evento.fechaEvento)) {
        setPagoError('La fecha límite no puede ser posterior al día del evento.')
        return
      }
    }

    if (modalidadPago === 'CUOTAS') {
      if (!planCuotas.fechaLimitePago) {
        setPagoError('Define la fecha límite de pago para el plan de cuotas.')
        return
      }
      if (new Date(planCuotas.fechaLimitePago) <= new Date()) {
        setPagoError('La fecha límite de pago debe ser posterior a hoy.')
        return
      }
      if (new Date(planCuotas.fechaLimitePago) > new Date(evento.fechaEvento)) {
        setPagoError('La fecha límite no puede ser posterior al día del evento.')
        return
      }
    }

    setPagoError(null)
    setPrecioData({
      ...values,
      pagosAdelanto: values.montoAdelanto > 0 ? pagosAdelanto : [],
      modalidadPago,
      ...(modalidadPago === 'CUOTAS'
        ? { numeroCuotas: planCuotas.numeroCuotas, fechaLimitePago: planCuotas.fechaLimitePago }
        : { fechaLimitePago: fechaLimitePagoContado }),
    })
    setPaso(3)
  }

  function handleGenerarContrato() {
    if (!plantillaId || !precioData) return
    generarContrato.mutate(
      { idEvento: evento.id, payload: { contenidoTexto: textoContrato, plantilla: plantillaId } },
      {
        onSuccess: () => {
          setContratoGenerado(true)
          toast.success('Contrato generado correctamente.')
        },
      }
    )
  }

  function handleConfirmar() {
    if (!precioData) return
    confirmar.mutate(
      {
        id: evento.id,
        payload: {
          precioTotal:     precioData.precioTotal,
          montoAdelanto:   precioData.montoAdelanto,
          pagosAdelanto:   precioData.pagosAdelanto.length > 0 ? precioData.pagosAdelanto : undefined,
          modalidadPago:   precioData.modalidadPago,
          numeroCuotas:    precioData.numeroCuotas,
          fechaLimitePago: precioData.fechaLimitePago,
        },
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-brand-rosa" />
            Confirmar evento
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-500 mb-1">
          <span className="font-semibold text-gray-900">{evento.tipoEvento}</span>
          {' · '}
          {evento.nombreCliente}
          {' · '}
          {formatDate(evento.fechaEvento)}
        </div>

        <StepIndicator paso={paso} />

        {paso === 1 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500 shrink-0" />
                <p className="text-sm font-bold text-gray-900">{evento.nombreCliente}</p>
              </div>

              {evento.correoCliente && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate max-w-[200px]">{evento.correoCliente}</span>
                  </div>
                  {mailtoCliente && (
                    <a
                      href={mailtoCliente}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul hover:underline"
                    >
                      Enviar correo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {evento.telefonoCliente && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{evento.telefonoCliente}</span>
                  </div>
                  {whatsappCliente && (
                    <a
                      href={whatsappCliente}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              {evento.contactoAdicional && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">Adicional:</span>
                  <span>{evento.contactoAdicional}</span>
                </div>
              )}
            </div>

            <div className="bg-brand-rosa/5 rounded-xl border border-brand-rosa/10 p-3 text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-semibold">Turno:</span>{' '}
                {evento.turno} · {evento.horaInicio} – {evento.horaFin}
              </p>
              {evento.aforoDeclarado && (
                <p>
                  <span className="font-semibold">Invitados:</span> {evento.aforoDeclarado} personas
                </p>
              )}
              {evento.observaciones && (
                <p>
                  <span className="font-semibold">Notas del cliente:</span> {evento.observaciones}
                </p>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-1">
              <Button variant="outline" className="rounded-xl" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                className="rounded-xl bg-brand-rosa hover:bg-brand-rosa/90 text-white gap-1.5"
                onClick={() => setPaso(2)}
              >
                Definir precio
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <form onSubmit={handleSubmit(onPrecioSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="precioTotal" className="text-sm font-semibold">
                Precio total del contrato (S/)
              </Label>
              <Input
                id="precioTotal"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="h-10 rounded-xl"
                {...register('precioTotal')}
              />
              {errors.precioTotal && (
                <p className="text-xs text-destructive">{errors.precioTotal.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="montoAdelanto" className="text-sm font-semibold">
                Adelanto recibido (S/)
              </Label>
              <Input
                id="montoAdelanto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-10 rounded-xl"
                {...register('montoAdelanto')}
              />
              {errors.montoAdelanto && (
                <p className="text-xs text-destructive">{errors.montoAdelanto.message}</p>
              )}
            </div>

            {montoAdelanto > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Medio(s) de pago del adelanto</Label>
                <MultiMedioPago
                  value={pagosAdelanto}
                  onChange={setPagosAdelanto}
                  totalEsperado={montoAdelanto}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Modalidad de pago</Label>
              <div className="flex gap-2">
                {(['AL_CONTADO', 'CUOTAS'] as ModalidadPago[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModalidadPago(m)}
                    className={cn(
                      'flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
                      modalidadPago === m
                        ? 'border-brand-azul bg-brand-azul/5 text-brand-azul'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    )}
                  >
                    {m === 'AL_CONTADO' ? 'Al contado' : 'En cuotas'}
                  </button>
                ))}
              </div>
            </div>

            {modalidadPago === 'AL_CONTADO' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Fecha límite de pago del saldo</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  max={evento.fechaEvento}
                  value={fechaLimitePagoContado}
                  onChange={(e) => setFechaLimitePagoContado(e.target.value)}
                  className="h-10 rounded-xl"
                />
                {fechaLimitePagoContado && new Date(fechaLimitePagoContado) > new Date(evento.fechaEvento) && (
                  <p className="text-xs text-destructive">
                    La fecha límite no puede ser posterior al día del evento.
                  </p>
                )}
              </div>
            )}

            {modalidadPago === 'CUOTAS' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Plan de cuotas</Label>
                <PlanCuotasBuilder
                  precioTotal={precioTotal}
                  montoAdelanto={montoAdelanto}
                  value={planCuotas}
                  onChange={setPlanCuotas}
                  fechaMaxima={evento.fechaEvento}
                />
              </div>
            )}

            {precioTotal > 0 && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold">{formatCurrency(precioTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Adelanto</span>
                  <span className="font-semibold text-green-700">{formatCurrency(montoAdelanto)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Saldo pendiente</span>
                  <span className={cn('font-black', saldo > 0 ? 'text-amber-600' : 'text-green-600')}>
                    {formatCurrency(saldo)}
                  </span>
                </div>
              </div>
            )}

            {pagoError && (
              <p className="text-xs text-destructive">{pagoError}</p>
            )}

            <div className="flex justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl gap-1.5"
                onClick={() => setPaso(1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand-rosa hover:bg-brand-rosa/90 text-white gap-1.5"
              >
                Gestionar contrato
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            {precioData && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-green-800">
                    Precio: <strong>{formatCurrency(precioData.precioTotal)}</strong>
                    {' · '}Adelanto: <strong>{formatCurrency(precioData.montoAdelanto)}</strong>
                    {' · '}Saldo: <strong>{formatCurrency(precioData.precioTotal - precioData.montoAdelanto)}</strong>
                  </span>
                </div>
                {precioData.fechaLimitePago && (
                  <p className="text-xs text-green-700 ml-6">
                    {precioData.modalidadPago === 'CUOTAS'
                      ? `${precioData.numeroCuotas} cuotas · vence ${formatDate(precioData.fechaLimitePago)}`
                      : `Pago único antes del ${formatDate(precioData.fechaLimitePago)}`}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm font-semibold text-gray-900">¿Cómo gestionas el contrato?</p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setOpcionContrato('plantilla')}
                className={cn(
                  'w-full text-left border-2 rounded-xl p-3.5 transition-all',
                  opcionContrato === 'plantilla'
                    ? 'border-brand-azul bg-brand-azul/5'
                    : 'border-gray-100 hover:border-brand-azul/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className={cn('h-4 w-4', opcionContrato === 'plantilla' ? 'text-brand-azul' : 'text-gray-400')} />
                  <span className="text-sm font-bold text-gray-900">Generar desde plantilla</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 ml-6">
                  Selecciona una plantilla y genera el contrato automáticamente con los datos del evento.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOpcionContrato('manual')}
                className={cn(
                  'w-full text-left border-2 rounded-xl p-3.5 transition-all',
                  opcionContrato === 'manual'
                    ? 'border-brand-azul bg-brand-azul/5'
                    : 'border-gray-100 hover:border-brand-azul/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className={cn('h-4 w-4', opcionContrato === 'manual' ? 'text-brand-azul' : 'text-gray-400')} />
                  <span className="text-sm font-bold text-gray-900">Subir contrato externo</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 ml-6">
                  Confirma el evento y accede al módulo de contratos para subir el documento firmado.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOpcionContrato('omitir')}
                className={cn(
                  'w-full text-left border-2 rounded-xl p-3.5 transition-all',
                  opcionContrato === 'omitir'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-100 hover:border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-bold', opcionContrato === 'omitir' ? 'text-gray-700' : 'text-gray-500')}>
                    Gestionar contrato después
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Confirma el evento ahora y gestiona el contrato más adelante desde el módulo de contratos.
                </p>
              </button>
            </div>

            {opcionContrato === 'plantilla' && (
              <div className="space-y-3 bg-gray-50 rounded-xl border border-gray-100 p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Plantilla</Label>
                  <Select
                    value={plantillaId}
                    onValueChange={(v) => setPlantillaId(v as PlantillaId)}
                  >
                    <SelectTrigger className="h-9 rounded-lg text-sm bg-white">
                      <SelectValue placeholder="Seleccionar plantilla..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PLANTILLAS) as [PlantillaId, { label: string }][]).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {plantillaId && (
                  <>
                    <div className="text-xs text-gray-500 bg-white rounded-lg border border-gray-200 p-2 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                      {textoContrato}
                    </div>
                    {!contratoGenerado ? (
                      <Button
                        size="sm"
                        className="rounded-lg bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5 w-full"
                        disabled={generarContrato.isPending}
                        onClick={handleGenerarContrato}
                      >
                        {generarContrato.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <FileText className="h-3.5 w-3.5" />
                        Generar contrato
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Contrato generado. Podrás editarlo desde el módulo de contratos.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {opcionContrato === 'manual' && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
                Tras confirmar el evento, accede a{' '}
                <strong>Admin → Contratos</strong> para subir el documento firmado y asociarlo a este evento.
              </div>
            )}

            <Separator />

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                className="rounded-xl gap-1.5"
                onClick={() => setPaso(2)}
                disabled={confirmar.isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white gap-1.5"
                disabled={!opcionContrato || confirmar.isPending}
                onClick={handleConfirmar}
              >
                {confirmar.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />}
                Confirmar evento
              </Button>
            </div>

            {!opcionContrato && (
              <p className="text-xs text-center text-gray-400">
                Selecciona una opción de contrato para continuar.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
