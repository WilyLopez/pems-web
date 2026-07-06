import Image from 'next/image'
import { Upload, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { PrecioLabel } from './PrecioLabel'
import { Disponibilidad } from '@/features/admin/calendario/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/Dialog'

export type MedioPago = 'YAPE' | 'CAJA'

interface PanelDetallePagoProps {
  metodoPago: MedioPago | null
  fechaSeleccionada: string | null
  dispSeleccionada: Disponibilidad | null
  precioMap?: Record<string, number>
  getTarifaKey: (
    fechaStr: string,
    esFeriado: boolean
  ) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  comprobante: File | null
  setComprobante: (file: File | null) => void
  codigoYape: string
  setCodigoYape: (value: string) => void
  intentoEnvio: boolean
}

export function PanelDetallePago({
  metodoPago,
  fechaSeleccionada,
  dispSeleccionada,
  precioMap,
  getTarifaKey,
  comprobante,
  setComprobante,
  codigoYape,
  setCodigoYape,
  intentoEnvio,
}: PanelDetallePagoProps) {
  if (!metodoPago) return null

  if (metodoPago === 'YAPE') {
    return (
      <div className="p-5 bg-[#6E2FEC]/5 border border-[#6E2FEC]/20 rounded-3xl space-y-4 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="w-20 h-20 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#6E2FEC]/20 transition-all"
              >
                <Image
                  src="/qr-yape.png"
                  alt="QR Yape"
                  width={80}
                  height={80}
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
                <div className="p-3 bg-white border border-purple-100 rounded-3xl shadow-sm">
                  <Image
                    src="/qr-yape.png"
                    alt="QR Yape Ampliado"
                    width={240}
                    height={240}
                    className="object-contain rounded-2xl"
                  />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-700">
                Kiki y Lala Zona de Juegos
              </p>
            </DialogContent>
          </Dialog>

          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700">
              Escanea el QR o yapea al número del local
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Envía exactamente{' '}
              {fechaSeleccionada && dispSeleccionada ? (
                <PrecioLabel
                  tipoDia={getTarifaKey(
                    fechaSeleccionada,
                    dispSeleccionada.esFeriado
                  )}
                  precioMap={precioMap}
                />
              ) : null}{' '}
              y escribe el nombre del niño en el concepto.
            </p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-purple-100">
          <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-[#6E2FEC]" />
            Comprobante de Pago Yape{' '}
            <span className="text-red-500">*</span>
          </p>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-[#6E2FEC]/10 file:text-[#6E2FEC] hover:file:bg-[#6E2FEC]/20 cursor-pointer"
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
              {comprobante.name} &middot;{' '}
              {(comprobante.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-700">
            Código de Operación Yape (opcional)
          </p>
          <Input
            placeholder="Ej: 123456789"
            inputMode="numeric"
            value={codigoYape}
            onChange={(e) => setCodigoYape(e.target.value)}
            className="h-10 rounded-xl font-mono focus:border-[#6E2FEC]"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3 shadow-sm animate-fade-in">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 leading-relaxed font-medium">
        <strong className="font-bold">Importante:</strong> El cupo quedará
        reservado temporalmente, pero el ingreso final al local solo se
        confirmará al efectuar el pago correspondiente en caja. Te
        aconsejamos llegar 10 minutos antes de tu hora planeada.
      </p>
    </div>
  )
}
