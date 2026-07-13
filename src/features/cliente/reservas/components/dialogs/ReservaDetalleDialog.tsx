import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Reserva } from '@/features/cliente/shared/types'
import { DetalleReserva } from '../ui/DetalleReserva'
import { ReprogramarReserva } from '../ui/ReprogramarReserva'
import { CancelarReserva } from '../ui/CancelarReserva'
import { PagarReserva } from '../ui/PagarReserva'

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
