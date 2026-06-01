'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, Download, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { Reserva } from '@/types/reserva.types'
import { EstadoBadge } from '@/components/cliente/EstadoBadge'
import {
  useReprogramarReservaCliente,
  useCancelarReservaCliente,
} from '@/hooks/useReservas'

interface ReservaDetalleModalProps {
  reserva: Reserva | null
  open: boolean
  onClose: () => void
}

export function ReservaDetalleModal({ reserva, open, onClose }: ReservaDetalleModalProps) {
  const [vista, setVista] = useState<'detalle' | 'reprogramar' | 'cancelar'>('detalle')

  function handleClose() {
    onClose()
    setVista('detalle')
  }

  if (!reserva) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {vista === 'detalle' && (
          <DetalleReserva
            reserva={reserva}
            onReprogramar={() => setVista('reprogramar')}
            onCancelar={() => setVista('cancelar')}
          />
        )}
        {vista === 'reprogramar' && (
          <ReprogramarReserva
            reserva={reserva}
            onVolver={() => setVista('detalle')}
            onExito={() => { setVista('detalle'); handleClose() }}
          />
        )}
        {vista === 'cancelar' && (
          <CancelarReserva
            reserva={reserva}
            onVolver={() => setVista('detalle')}
            onExito={() => { setVista('detalle'); handleClose() }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FilaDetalle({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{valor}</span>
    </div>
  )
}

interface DetalleProps {
  reserva: Reserva
  onReprogramar: () => void
  onCancelar: () => void
}

function DetalleReserva({ reserva, onReprogramar, onCancelar }: DetalleProps) {
  const puedeReprogramar =
    (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') &&
    reserva.vecesReprogramada === 0
  const puedeCancelar =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'

  const turnoLabel =
    reserva.turno === 'T1'
      ? 'Mañana 10:00 – 14:00'
      : reserva.turno === 'T2'
      ? 'Tarde 16:00 – 20:00'
      : null

  return (
    <div className="flex flex-col">
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
        <p className="font-mono text-sm font-bold text-gray-700">{reserva.numeroTicket}</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <FilaDetalle label="Estado" valor={<EstadoBadge estado={reserva.estado} />} />
        <FilaDetalle
          label="Fecha"
          valor={formatDate(reserva.fechaEvento, "d 'de' MMMM yyyy")}
        />
        {turnoLabel && <FilaDetalle label="Turno" valor={turnoLabel} />}
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

      {reserva.estado === 'PENDIENTE' && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Presenta este ticket en caja para confirmar tu ingreso.
          </p>
        </div>
      )}

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-2">
        <a
          href={`/api/v1/reservas/${reserva.id}/pdf`}
          download
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Descargar ticket PDF
        </a>
        {(puedeReprogramar || puedeCancelar) && (
          <div className="grid grid-cols-2 gap-2">
            {puedeReprogramar && (
              <button
                onClick={onReprogramar}
                className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all"
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
}

function SelectorFechaCompacto({
  fechaSeleccionada,
  onSelect,
}: {
  fechaSeleccionada: string | null
  onSelect: (fecha: string) => void
}) {
  const hoy = new Date()
  const dias = Array.from({ length: 14 }, (_, i) => addDays(hoy, i + 1))

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600">Selecciona la nueva fecha</p>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-hide">
        {dias.map((dia) => {
          const fechaStr = format(dia, 'yyyy-MM-dd')
          const seleccionado = fechaSeleccionada === fechaStr
          return (
            <button
              key={fechaStr}
              onClick={() => onSelect(fechaStr)}
              className={cn(
                'flex flex-col items-center min-w-[52px] rounded-xl p-2 border snap-start transition-all shrink-0',
                seleccionado
                  ? 'bg-brand-azul text-white border-brand-azul'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-azul/40'
              )}
            >
              <span className="text-[10px] uppercase font-semibold">
                {format(dia, 'EEE', { locale: es })}
              </span>
              <span className="text-lg font-black leading-tight">{format(dia, 'd')}</span>
              <span className="text-[10px]">{format(dia, 'MMM', { locale: es })}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReprogramarReserva({ reserva, onVolver, onExito }: SubVistaProps) {
  const [nuevaFecha, setNuevaFecha] = useState<string | null>(null)
  const reprogramar = useReprogramarReservaCliente()

  async function confirmar() {
    if (!nuevaFecha) return
    try {
      await reprogramar.mutateAsync({ id: reserva.id, nuevaFecha })
      toast.success('Reserva reprogramada exitosamente.')
      onExito()
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onVolver} className="text-gray-400 hover:text-gray-600">
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
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
        >
          Volver
        </button>
        <button
          onClick={confirmar}
          disabled={!nuevaFecha || reprogramar.isPending}
          className="py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50"
        >
          {reprogramar.isPending ? 'Reprogramando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}

function CancelarReserva({ reserva, onVolver, onExito }: SubVistaProps) {
  const [motivo, setMotivo] = useState('')
  const cancelar = useCancelarReservaCliente()

  async function confirmar() {
    try {
      await cancelar.mutateAsync({ id: reserva.id, motivo })
      toast.success('Reserva cancelada.')
      onExito()
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onVolver} className="text-gray-400 hover:text-gray-600">
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
            <p className="text-sm font-bold text-red-800">¿Seguro que deseas cancelar?</p>
            <p className="text-xs text-red-700 mt-0.5">
              Esta acción no se puede deshacer. El cupo quedará disponible para otros clientes.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <p className="text-sm font-bold text-gray-900">
            {formatDate(reserva.fechaEvento, "EEEE d 'de' MMMM")}
          </p>
          <p className="text-xs text-gray-500">
            Visita de {reserva.nombreNino} · {formatCurrency(reserva.totalPagado)}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">Motivo (opcional)</label>
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
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
        >
          No cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={cancelar.isPending}
          className="py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-red-700"
        >
          {cancelar.isPending ? 'Cancelando...' : 'Sí, cancelar'}
        </button>
      </div>
    </div>
  )
}
