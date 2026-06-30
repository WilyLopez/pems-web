'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Loader2, CheckCircle2, ImageOff, ZoomIn, AlertTriangle, X } from 'lucide-react'

import { useConfirmarPago, useRechazarPago } from '../../hooks/useReservasData'
import { Reserva } from '../../types'
import { formatCurrency } from '@/lib/utils'

interface ValidarPagoDialogProps {
  open: boolean
  onClose: () => void
  reserva?: Reserva
}

export const ValidarPagoDialog = React.memo(
  ({ open, onClose, reserva }: ValidarPagoDialogProps) => {
    const confirmarPago = useConfirmarPago()
    const rechazarPago = useRechazarPago()
    const [modoRechazo, setModoRechazo] = useState(false)
    const [motivo, setMotivo] = useState('')


    const handleConfirm = () => {

      if (!reserva?.id) return
      confirmarPago.mutate(reserva.id, {
        onSuccess: () => {
          onClose()
        },
      })
    }

    const handleReject = () => {
      if (!reserva?.id) return
      rechazarPago.mutate(
        { id: reserva.id, motivo },
        {
          onSuccess: () => {
            setModoRechazo(false)
            setMotivo('')
            onClose()
          },
        }
      )
    }

    const handleClose = () => {
      setModoRechazo(false)
      setMotivo('')
      onClose()
    }

    const tieneComprobante =
      reserva?.referenciaPago && reserva.referenciaPago.startsWith('http')

    const yaConfirmado = reserva?.estado === 'CONFIRMADA'

    return (
      <>
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
          <DialogContent className="max-w-lg w-[95vw] md:w-full rounded-3xl p-0 overflow-hidden">

            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-base font-black text-gray-900">
                {modoRechazo ? 'Rechazar comprobante Yape' : 'Validar pago Yape'}
              </DialogTitle>
              {reserva && (
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Ticket{' '}
                  <span className="font-mono font-bold text-gray-700">
                    {reserva.numeroTicket}
                  </span>
                </p>
              )}
            </DialogHeader>

            {modoRechazo ? (
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-800">Rechazo de pago</p>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Se limpiará la referencia del comprobante y se le notificará al cliente para que suba uno nuevo.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Motivo de rechazo
                  </label>
                  <textarea
                    placeholder="Ej: Captura borrosa, monto incorrecto, captura de otra transacción..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full min-h-[80px] rounded-2xl border border-gray-200 focus-visible:ring-brand-azul p-3 text-sm border focus:outline-none transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'Comprobante inválido o borroso',
                      'Monto insuficiente (tiene 2 horas para completar el pago)',
                      'Fecha de pago incorrecta',
                      'Código de operación ya utilizado',
                    ].map((msg) => (
                      <button
                        key={msg}
                        type="button"
                        onClick={() => setMotivo(msg)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all text-left"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              <div className="px-6 py-5 space-y-4">
                {reserva && (
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-gray-50 rounded-2xl p-2.5 md:p-3">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Cliente
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5 truncate">
                        {reserva.nombreCliente ?? '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-2.5 md:p-3">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Monto
                      </p>
                      <p className="text-xs md:text-sm font-black text-green-600 mt-0.5">
                        {formatCurrency(reserva.totalPagado)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-2.5 md:p-3">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Fecha evento
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5">
                        {reserva.fechaEvento}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-2.5 md:p-3">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Estado
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5">
                        {reserva.estado}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                    Comprobante de pago
                  </p>
                  {tieneComprobante ? (
                    <div className="relative group">
                      <a
                        href={reserva!.referenciaPago!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block rounded-2xl overflow-hidden border border-gray-200 hover:border-amber-400 transition-colors"
                      >
                        <img
                          src={reserva!.referenciaPago!}
                          alt="Comprobante de pago Yape"
                          className="w-full max-h-48 md:max-h-64 object-contain bg-gray-50"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                      </a>
                    </div>

                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-6 md:py-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                      <ImageOff className="h-8 w-8 text-gray-300" />
                      <p className="text-xs text-gray-400 font-medium">
                        El cliente no ha subido el comprobante aun
                      </p>
                    </div>
                  )}
                </div>

                {yaConfirmado ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm font-medium text-green-700">
                      Este pago ya fue confirmado.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Al confirmar, la reserva pasara a estado{' '}
                    <strong className="text-gray-700">CONFIRMADA</strong> y el
                    cliente recibira una notificacion.
                  </p>
                )}
              </div>
            )}

            <div className="px-6 pb-6 flex gap-2 md:gap-3 justify-end">
              {modoRechazo ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModoRechazo(false)}
                    className="rounded-xl"
                    disabled={rechazarPago.isPending}
                  >
                    Volver
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReject}
                    disabled={rechazarPago.isPending || !motivo.trim()}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  >
                    {rechazarPago.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Confirmar rechazo'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    className="rounded-xl"
                    disabled={confirmarPago.isPending}
                  >
                    Cerrar
                  </Button>
                  {!yaConfirmado && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModoRechazo(true)}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={confirmarPago.isPending}
                      >
                        Rechazar pago
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleConfirm}
                        disabled={confirmarPago.isPending}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {confirmarPago.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Confirmar pago'
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>



      </>
    )
  }
)

ValidarPagoDialog.displayName = 'ValidarPagoDialog'
