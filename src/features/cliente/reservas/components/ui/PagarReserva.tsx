import { useState } from 'react'
import Image from 'next/image'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Upload,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'

export interface PagarReservaProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onSubirComprobante: (params: {
    id: number
    comprobante: File
  }) => Promise<any>
  isSubiendo: boolean
}

export function PagarReserva({
  reserva,
  onVolver,
  onExito,
  onSubirComprobante,
  isSubiendo,
}: PagarReservaProps) {
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
