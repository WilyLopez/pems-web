import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pencil, Loader2, Ticket } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import Image from 'next/image'
import { PrecioLabel } from './PrecioLabel'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { MedioPago } from './PanelDetallePago'

interface ResumenMobileProps {
  fechaSeleccionada: string
  dispSeleccionada: Disponibilidad
  horaApertura: string
  horaCierre: string
  metodoPago: MedioPago | null
  precioMap?: Record<string, number>
  getTarifaKey: (
    fechaStr: string,
    esFeriado: boolean
  ) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  onEditarDatos: () => void
  onEditarPago: () => void
  onConfirmar: () => void
  isPending: boolean
  control: any
}

export function ResumenMobile({
  fechaSeleccionada,
  dispSeleccionada,
  horaApertura,
  horaCierre,
  metodoPago,
  precioMap,
  getTarifaKey,
  onEditarDatos,
  onEditarPago,
  onConfirmar,
  isPending,
  control,
}: ResumenMobileProps) {
  const nombreNino = useWatch({ control, name: 'nombreNino' })
  const edadNino = useWatch({ control, name: 'edadNino' })
  const nombreAcompanante = useWatch({ control, name: 'nombreAcompanante' })
  const dniAcompanante = useWatch({ control, name: 'dniAcompanante' })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Fecha
          </p>
        </div>
        <p className="font-black text-gray-900 text-sm capitalize">
          {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM yyyy", {
            locale: es,
          })}
        </p>
        <p className="text-[11px] text-gray-400">
          Horario de atención: {horaApertura} - {horaCierre}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Datos del visitante
          </p>
          <button
            onClick={onEditarDatos}
            className="flex items-center gap-1 text-[11px] font-bold text-brand-azul"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        </div>
        <div className="text-xs text-gray-700">
          <span className="text-gray-400">Niño: </span>
          <strong className="text-gray-800">{nombreNino}</strong>
          {edadNino !== undefined && !isNaN(Number(edadNino)) && (
            <span className="text-gray-400"> ({edadNino} años)</span>
          )}
        </div>
        <div className="text-xs text-gray-700">
          <span className="text-gray-400">Acompañante: </span>
          <strong className="text-gray-800">{nombreAcompanante}</strong>
          {dniAcompanante && (
            <span className="text-gray-400 font-mono text-[11px]">
              {' '}
              (DNI: {dniAcompanante})
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Método de pago
          </p>
          <button
            onClick={onEditarPago}
            className="flex items-center gap-1 text-[11px] font-bold text-brand-azul"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          {metodoPago === 'YAPE' ? (
            <>
              <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-purple-100 relative bg-white">
                <Image
                  src="/metodo-pago-yape.png"
                  alt="Yape"
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              <span className="text-xs font-bold text-gray-800">Yape</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-blue-100 relative bg-white">
                <Image
                  src="/metodo-pago-local.png"
                  alt="Pago en Local"
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              <span className="text-xs font-bold text-gray-800">
                Pago en Local
              </span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-bold">Total a pagar</p>
          <p className="text-[10px] text-gray-400 font-medium">
            Impuestos incluidos
          </p>
        </div>
        <PrecioLabel
          tipoDia={getTarifaKey(fechaSeleccionada, dispSeleccionada.esFeriado)}
          precioMap={precioMap}
        />
      </div>

      <button
        onClick={onConfirmar}
        disabled={isPending}
        className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-rosa"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando reserva...
          </>
        ) : (
          <>
            <Ticket className="h-4 w-4" />
            Confirmar y Finalizar Reserva
          </>
        )}
      </button>
    </div>
  )
}
