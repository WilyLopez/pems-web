import { useState } from 'react'
import Image from 'next/image'
import { format, addDays, startOfDay, isBefore, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Download,
  ChevronLeft,
  Clock,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import {
  cn,
  formatDate,
  formatCurrency,
  esFechaHoyEnZonaNegocio,
  yaPasoLaHoraEnZonaNegocio,
} from '@/lib/utils'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { Reserva } from '@/features/cliente/shared/types'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'

type Vista = 'detalle' | 'reprogramar' | 'cancelar' | 'pagar'

interface ReservaDetalleDialogProps {
  reserva: Reserva | null
  open: boolean
  onClose: () => void
  vistaInicial?: Vista
  onReprogramar?: (params: { id: number; nuevaFecha: string }) => Promise<any>
  isReprogramando?: boolean
  onCancelar?: (params: { id: number; motivo: string }) => Promise<any>
  isCancelando?: boolean
  onSubirComprobante?: (params: {
    id: number
    comprobante: File
  }) => Promise<any>
  isSubiendoComprobante?: boolean
}

export function ReservaDetalleDialog({
  reserva,
  open,
  onClose,
  vistaInicial = 'detalle',
  onReprogramar,
  isReprogramando = false,
  onCancelar,
  isCancelando = false,
  onSubirComprobante,
  isSubiendoComprobante = false,
}: ReservaDetalleDialogProps) {
  const [vista, setVista] = useState<Vista>('detalle')
  const [openAnterior, setOpenAnterior] = useState(open)

  if (open !== openAnterior) {
    setOpenAnterior(open)
    if (open) setVista(vistaInicial)
  }

  function handleClose() {
    onClose()
    setVista('detalle')
  }

  if (!reserva) return null

  const tieneReprogramar = !!onReprogramar
  const tieneCancelar = !!onCancelar
  const tienePagar = !!onSubirComprobante

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {vista === 'detalle' && (
          <DetalleReserva
            reserva={reserva}
            onReprogramar={() => setVista('reprogramar')}
            onCancelar={() => setVista('cancelar')}
            onPagar={() => setVista('pagar')}
            puedeReprogramarAccion={tieneReprogramar}
            puedeCancelarAccion={tieneCancelar}
            puedePagarAccion={tienePagar}
          />
        )}
        {vista === 'reprogramar' && onReprogramar && (
          <ReprogramarReserva
            reserva={reserva}
            onVolver={() => setVista('detalle')}
            onExito={() => {
              setVista('detalle')
              handleClose()
            }}
            onReprogramar={onReprogramar}
            isReprogramando={isReprogramando}
          />
        )}
        {vista === 'cancelar' && onCancelar && (
          <CancelarReserva
            reserva={reserva}
            onVolver={() => setVista('detalle')}
            onExito={() => {
              setVista('detalle')
              handleClose()
            }}
            onCancelar={onCancelar}
            isCancelando={isCancelando}
          />
        )}
        {vista === 'pagar' && onSubirComprobante && (
          <PagarReserva
            reserva={reserva}
            onVolver={() => setVista('detalle')}
            onExito={() => setVista('detalle')}
            onSubirComprobante={onSubirComprobante}
            isSubiendo={isSubiendoComprobante}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FilaDetalle({
  label,
  valor,
}: {
  label: string
  valor: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">
        {valor}
      </span>
    </div>
  )
}

interface DetalleProps {
  reserva: Reserva
  onReprogramar: () => void
  onCancelar: () => void
  onPagar: () => void
  puedeReprogramarAccion: boolean
  puedeCancelarAccion: boolean
  puedePagarAccion: boolean
}

function DetalleReserva({
  reserva,
  onReprogramar,
  onCancelar,
  onPagar,
  puedeReprogramarAccion,
  puedeCancelarAccion,
  puedePagarAccion,
}: DetalleProps) {
  const esActiva =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'
  const puedeReprogramar =
    puedeReprogramarAccion && esActiva && reserva.vecesReprogramada === 0
  const yaUsoReprogramacion =
    puedeReprogramarAccion && esActiva && reserva.vecesReprogramada > 0
  const puedeCancelar = puedeCancelarAccion && esActiva
  const rechazado =
    puedePagarAccion &&
    reserva.estado === 'PENDIENTE' &&
    !reserva.referenciaPago &&
    !!reserva.motivoRechazoPago
  const faltaPagar =
    puedePagarAccion &&
    reserva.estado === 'PENDIENTE' &&
    !reserva.referenciaPago &&
    !rechazado
  const enRevision = reserva.estado === 'PENDIENTE' && !!reserva.referenciaPago

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <DialogTitle className="text-lg font-black text-gray-900">
          Detalle de reserva
        </DialogTitle>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 bg-gray-50">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reserva.numeroTicket)}`}
          alt={reserva.numeroTicket}
          className="rounded-2xl border border-gray-200 bg-white p-2"
          width={180}
          height={180}
        />
        <p className="font-mono text-sm font-bold text-gray-700">
          {reserva.numeroTicket}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <FilaDetalle
          label="Estado"
          valor={<EstadoBadge estado={reserva.estado} />}
        />
        <FilaDetalle
          label="Fecha"
          valor={formatDate(reserva.fechaEvento, "d 'de' MMMM yyyy")}
        />
        <FilaDetalle
          label="Niño"
          valor={`${reserva.nombreNino} · ${reserva.edadNino} años`}
        />
        <FilaDetalle label="Acompañante" valor={reserva.nombreAcompanante} />
        {reserva.dniAcompanante && (
          <FilaDetalle label="DNI" valor={reserva.dniAcompanante} />
        )}
        <FilaDetalle
          label="Total"
          valor={
            <span className="font-black text-brand-azul">
              {formatCurrency(reserva.totalPagado)}
            </span>
          }
        />
        {reserva.medioPago && (
          <FilaDetalle label="Método de pago" valor={reserva.medioPago} />
        )}
      </div>

      {rechazado && (
        <div className="mx-5 mb-4 space-y-2">
          <div className="flex items-start gap-2 bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <span className="font-bold">Tu comprobante fue rechazado.</span>{' '}
              {reserva.motivoRechazoPago}
            </p>
          </div>
          <button
            onClick={onPagar}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {faltaPagar && (
        <div className="mx-5 mb-4">
          <button
            onClick={onPagar}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          >
            <Image
              src="/metodo-pago-yape.png"
              alt=""
              width={16}
              height={16}
              className="rounded-sm"
            />
            Pagar ahora con Yape
          </button>
        </div>
      )}

      {enRevision && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-brand-azul/5 border border-brand-azul/20 rounded-xl px-3 py-2.5">
          <Clock className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
          <p className="text-xs text-brand-azul/90">
            Tu comprobante está en revisión. Te avisaremos apenas se valide.
          </p>
        </div>
      )}

      {yaUsoReprogramacion && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Ya utilizaste tu reprogramación para esta reserva.
          </p>
        </div>
      )}

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-2">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/reservas/${reserva.id}/pdf`}
          download
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/50 focus-visible:ring-offset-1"
        >
          <Download className="h-4 w-4" />
          Descargar ticket PDF
        </a>
        {(puedeReprogramar || puedeCancelar) && (
          <div className="grid grid-cols-2 gap-2">
            {puedeReprogramar && (
              <button
                onClick={onReprogramar}
                className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
              >
                Reprogramar
              </button>
            )}
            {puedeCancelar && (
              <button
                onClick={onCancelar}
                className={cn(
                  'py-2.5 rounded-xl border text-sm font-semibold transition-all',
                  puedeReprogramar
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'col-span-2 border-red-200 text-red-600 hover:bg-red-50'
                )}
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface SubVistaProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onReprogramar: (params: { id: number; nuevaFecha: string }) => Promise<any>
  isReprogramando: boolean
}

function SelectorFechaCompacto({
  idSede,
  fechaSeleccionada,
  onSelect,
}: {
  idSede: number
  fechaSeleccionada: string | null
  onSelect: (fecha: string) => void
}) {
  const { data: config } = useConfiguracionCalendario(idSede)
  const diasMin = config?.diasMinReservaPublica ?? 0
  const diasMax = config?.diasMaxReservaPublica ?? 14
  const horaCierre = config?.horaCierre ?? '20:00'

  const hoy = startOfDay(new Date())
  const dias = Array.from({ length: diasMax + 1 }, (_, i) => addDays(hoy, i))

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(
    idSede,
    format(hoy, 'yyyy-MM-dd'),
    format(addDays(hoy, diasMax), 'yyyy-MM-dd')
  )

  const getDisp = (dia: Date) =>
    disponibilidades?.find((d) => d.fecha === format(dia, 'yyyy-MM-dd'))

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600">
        Selecciona la nueva fecha
      </p>
      <p className="text-[11px] text-gray-400">
        Hasta {diasMax} días de anticipación. Solo se muestran fechas con cupo
        disponible.
      </p>
      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[68px] min-w-[52px] shrink-0 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-hide">
          {dias.map((dia) => {
            const fechaStr = format(dia, 'yyyy-MM-dd')
            const disp = getDisp(dia)
            const minDia = startOfDay(addDays(hoy, diasMin))
            const maxDia = startOfDay(addDays(hoy, diasMax))
            const fueraDeRango = isBefore(dia, minDia) || isAfter(dia, maxDia)
            const cerroHoy =
              esFechaHoyEnZonaNegocio(fechaStr) &&
              yaPasoLaHoraEnZonaNegocio(horaCierre)
            const disabled =
              fueraDeRango || !disp || !disp.disponiblePublico || cerroHoy
            const seleccionado = fechaSeleccionada === fechaStr

            return (
              <button
                key={fechaStr}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(fechaStr)}
                className={cn(
                  'flex flex-col items-center min-w-[52px] rounded-xl p-2 border snap-start transition-all shrink-0',
                  seleccionado && 'bg-brand-azul text-white border-brand-azul',
                  !seleccionado &&
                    !disabled &&
                    'bg-white text-gray-700 border-gray-200 hover:border-brand-azul/40',
                  disabled &&
                    'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400'
                )}
              >
                <span className="text-[10px] uppercase font-semibold">
                  {format(dia, 'EEE', { locale: es })}
                </span>
                <span className="text-lg font-black leading-tight">
                  {format(dia, 'd')}
                </span>
                <span className="text-[10px]">
                  {format(dia, 'MMM', { locale: es })}
                </span>
                {!disabled && disp && (
                  <span
                    className={cn(
                      'text-[8px] font-bold mt-0.5 leading-none',
                      seleccionado ? 'text-white/90' : 'text-green-600'
                    )}
                  >
                    {disp.plazasDisponibles} pl.
                  </span>
                )}
                {disabled && !fueraDeRango && disp?.aforoCompleto && (
                  <span className="text-[8px] font-bold text-red-400 mt-0.5 leading-none">
                    Lleno
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReprogramarReserva({
  reserva,
  onVolver,
  onExito,
  onReprogramar,
  isReprogramando,
}: SubVistaProps) {
  const [nuevaFecha, setNuevaFecha] = useState<string | null>(null)

  async function confirmar() {
    if (!nuevaFecha) return
    try {
      await onReprogramar({ id: reserva.id, nuevaFecha })
      onExito()
    } catch {
      // toast is managed inside the hook
    }
  }

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onVolver}
          aria-label="Volver"
          className="text-gray-400 hover:text-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <DialogTitle className="text-lg font-black text-gray-900">
          Reprogramar reserva
        </DialogTitle>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-amber-800">
            Solo puedes reprogramar una vez. Selecciona la nueva fecha.
          </p>
        </div>

        <SelectorFechaCompacto
          idSede={reserva.idSede}
          fechaSeleccionada={nuevaFecha}
          onSelect={setNuevaFecha}
        />

        {nuevaFecha && (
          <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-xl p-3">
            <p className="text-sm font-bold text-gray-900">
              {formatDate(nuevaFecha, "EEEE d 'de' MMMM")}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={onVolver}
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          Volver
        </button>
        <button
          onClick={confirmar}
          disabled={!nuevaFecha || isReprogramando}
          className="py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-azul/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/50 focus-visible:ring-offset-1"
          type="button"
        >
          {isReprogramando ? 'Reprogramando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}

interface CancelarProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onCancelar: (params: { id: number; motivo: string }) => Promise<any>
  isCancelando: boolean
}

function CancelarReserva({
  reserva,
  onVolver,
  onExito,
  onCancelar,
  isCancelando,
}: CancelarProps) {
  const [motivo, setMotivo] = useState('')

  async function confirmar() {
    try {
      await onCancelar({
        id: reserva.id,
        motivo: motivo.trim() || (null as any),
      })
      onExito()
    } catch {
      // toast is managed inside the hook
    }
  }

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onVolver}
          aria-label="Volver"
          className="text-gray-400 hover:text-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <DialogTitle className="text-lg font-black text-gray-900">
          Cancelar reserva
        </DialogTitle>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">
              ¿Seguro que deseas cancelar?
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Esta acción no se puede deshacer. El cupo quedará disponible para
              otros clientes.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <p className="text-sm font-bold text-gray-900">
            {formatDate(reserva.fechaEvento, "EEEE d 'de' MMMM")}
          </p>
          <p className="text-xs text-gray-500">
            Visita de {reserva.nombreNino} ·{' '}
            {formatCurrency(reserva.totalPagado)}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">
            Motivo (opcional)
          </label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Cuéntanos por qué cancelas"
            rows={2}
            className="rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={onVolver}
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          No cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={isCancelando}
          className="py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1"
          type="button"
        >
          {isCancelando ? 'Cancelando...' : 'Sí, cancelar'}
        </button>
      </div>
    </div>
  )
}

interface PagarProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onSubirComprobante: (params: {
    id: number
    comprobante: File
  }) => Promise<any>
  isSubiendo: boolean
}

function PagarReserva({
  reserva,
  onVolver,
  onExito,
  onSubirComprobante,
  isSubiendo,
}: PagarProps) {
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  async function confirmar() {
    setIntentoEnvio(true)
    if (!comprobante) return
    try {
      await onSubirComprobante({ id: reserva.id, comprobante })
      onExito()
    } catch {
      // toast is managed inside the hook
    }
  }

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onVolver}
          aria-label="Volver"
          className="text-gray-400 hover:text-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <DialogTitle className="text-lg font-black text-gray-900">
          Pagar reserva
        </DialogTitle>
      </div>

      <div className="px-5 py-4 space-y-4">
        {reserva.motivoRechazoPago && !reserva.referenciaPago && (
          <div className="flex items-start gap-2 bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <span className="font-bold">Comprobante anterior rechazado.</span>{' '}
              {reserva.motivoRechazoPago}
            </p>
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Ampliar código QR de Yape"
                  className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-brand-rosa/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50"
                >
                  <Image
                    src="/qr-yape.png"
                    alt="QR Yape"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm rounded-3xl p-6 text-center">
                <DialogHeader>
                  <DialogTitle className="text-base font-black text-gray-900">
                    Código QR Yape
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Escanea para realizar el pago de tu reserva
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4 flex justify-center">
                  <div className="p-3 bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <Image
                      src="/qr-yape.png"
                      alt="QR Yape ampliado"
                      width={240}
                      height={240}
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Image
                  src="/metodo-pago-yape.png"
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
                Escanea el QR o yapea al número del local
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Envía exactamente{' '}
                <span className="font-bold text-gray-700">
                  {formatCurrency(reserva.totalPagado)}
                </span>{' '}
                y escribe el nombre del niño en el concepto.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-brand-rosa" />
            Comprobante de pago Yape <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-brand-rosa/10 file:text-brand-rosa hover:file:bg-brand-rosa/20 cursor-pointer"
            onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
          />
          {intentoEnvio && !comprobante && (
            <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Debes subir la captura del comprobante Yape
            </p>
          )}
          {comprobante && (
            <p className="flex items-center gap-1 text-xs text-green-700 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {comprobante.name} &middot; {(comprobante.size / 1024).toFixed(0)}{' '}
              KB
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={onVolver}
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          Volver
        </button>
        <button
          onClick={confirmar}
          disabled={isSubiendo}
          className="py-2.5 rounded-xl bg-brand-rosa text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-rosa/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          type="button"
        >
          {isSubiendo ? 'Enviando...' : 'Enviar comprobante'}
        </button>
      </div>
    </div>
  )
}
