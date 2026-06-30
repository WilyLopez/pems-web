import Image from 'next/image'
import { ChevronLeft, ChevronRight, AlertCircle, Ticket, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PanelDetallePago, MedioPago } from './PanelDetallePago'
import { ResumenMobile } from './ResumenMobile'
import { Disponibilidad } from '@/features/admin/calendario/types'

export type SubPasoPago = 'metodo' | 'resumen'

interface PaymentStepProps {
  metodoPago: MedioPago | null
  setMetodoPago: (m: MedioPago | null) => void
  comprobante: File | null
  setComprobante: (file: File | null) => void
  codigoYape: string
  setCodigoYape: (value: string) => void
  intentoEnvio: boolean
  setIntentoEnvio: (val: boolean) => void
  subPasoPago: SubPasoPago
  setSubPasoPago: (s: SubPasoPago) => void
  fechaSeleccionada: string
  dispSeleccionada: Disponibilidad
  horaApertura: string
  horaCierre: string
  precioMap: Record<string, number> | undefined
  getTarifaKey: (fechaStr: string, esFeriado: boolean) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  onBack: () => void
  onConfirmar: () => void
  isPending: boolean
  control: any
}

export function PaymentStep({
  metodoPago,
  setMetodoPago,
  comprobante,
  setComprobante,
  codigoYape,
  setCodigoYape,
  intentoEnvio,
  setIntentoEnvio,
  subPasoPago,
  setSubPasoPago,
  fechaSeleccionada,
  dispSeleccionada,
  horaApertura,
  horaCierre,
  precioMap,
  getTarifaKey,
  onBack,
  onConfirmar,
  isPending,
  control,
}: PaymentStepProps) {
  function puedeAvanzarPago() {
    if (!metodoPago) return false
    if (metodoPago === 'YAPE' && !comprobante) return false
    return true
  }

  function continuarAResumenMobile() {
    setIntentoEnvio(true)
    if (!puedeAvanzarPago()) return
    setIntentoEnvio(false)
    setSubPasoPago('resumen')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => {
            if (subPasoPago === 'resumen') {
              setSubPasoPago('metodo')
              return
            }
            onBack()
          }}
          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors bg-white shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          {subPasoPago === 'resumen' ? (
            <span className="lg:hidden">Revisa y confirma</span>
          ) : null}
          <span className={subPasoPago === 'resumen' ? 'hidden lg:inline' : undefined}>
            Método de pago
          </span>
        </h1>
      </div>

      <div className="hidden lg:block space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMetodoPago('YAPE')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-sm bg-white',
              metodoPago === 'YAPE'
                ? 'border-[#6E2FEC] bg-[#6E2FEC]/5 ring-2 ring-[#6E2FEC]/10'
                : 'border-gray-100 hover:border-gray-200'
            )}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border border-purple-100 bg-white shadow-sm">
              <Image
                src="/metodo-pago-yape.png"
                alt="Yape"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900 leading-tight">Yape</p>
              <p className="text-[10px] text-gray-500 font-medium">Pago rápido digital</p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              metodoPago === 'YAPE' ? 'border-[#6E2FEC] bg-[#6E2FEC]' : 'border-gray-200'
            )}>
              {metodoPago === 'YAPE' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMetodoPago('CAJA')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-sm bg-white',
              metodoPago === 'CAJA'
                ? 'border-brand-azul bg-brand-azul/5 ring-2 ring-brand-azul/10'
                : 'border-gray-100 hover:border-gray-200'
            )}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border border-blue-50 bg-white shadow-sm">
              <Image
                src="/metodo-pago-local.png"
                alt="Pago en Local"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900 leading-tight">Pago en Caja</p>
              <p className="text-[10px] text-gray-500 font-medium">Efectivo o tarjeta en local</p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              metodoPago === 'CAJA' ? 'border-brand-azul bg-brand-azul' : 'border-gray-200'
            )}>
              {metodoPago === 'CAJA' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        </div>

        <PanelDetallePago
          metodoPago={metodoPago}
          fechaSeleccionada={fechaSeleccionada}
          dispSeleccionada={dispSeleccionada}
          precioMap={precioMap}
          getTarifaKey={getTarifaKey}
          comprobante={comprobante}
          setComprobante={setComprobante}
          codigoYape={codigoYape}
          setCodigoYape={setCodigoYape}
          intentoEnvio={intentoEnvio}
        />

        {intentoEnvio && !metodoPago && (
          <p className="flex items-center gap-1 text-xs text-red-600 mt-1 justify-center">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Selecciona un método de pago para continuar
          </p>
        )}

        <button
          onClick={onConfirmar}
          disabled={isPending}
          className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-rosa mt-6"
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

      <div className="lg:hidden">
        {subPasoPago === 'metodo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago('YAPE')}
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 bg-white',
                  metodoPago === 'YAPE'
                    ? 'border-[#6E2FEC] bg-[#6E2FEC]/5 ring-2 ring-[#6E2FEC]/10'
                    : 'border-gray-100'
                )}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-purple-100 bg-white">
                  <Image
                    src="/metodo-pago-yape.png"
                    alt="Yape"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-900 leading-tight">Yape</p>
                  <p className="text-[9px] text-gray-500 font-medium">Digital</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('CAJA')}
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 bg-white',
                  metodoPago === 'CAJA'
                    ? 'border-brand-azul bg-brand-azul/5 ring-2 ring-brand-azul/10'
                    : 'border-gray-100'
                )}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-blue-50 bg-white">
                  <Image
                    src="/metodo-pago-local.png"
                    alt="Caja"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-900 leading-tight">En Caja</p>
                  <p className="text-[9px] text-gray-500 font-medium">Local</p>
                </div>
              </button>
            </div>

            <PanelDetallePago
              metodoPago={metodoPago}
              fechaSeleccionada={fechaSeleccionada}
              dispSeleccionada={dispSeleccionada}
              precioMap={precioMap}
              getTarifaKey={getTarifaKey}
              comprobante={comprobante}
              setComprobante={setComprobante}
              codigoYape={codigoYape}
              setCodigoYape={setCodigoYape}
              intentoEnvio={intentoEnvio}
            />

            {intentoEnvio && !metodoPago && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1 justify-center">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Selecciona un método de pago para continuar
              </p>
            )}

            <button
              onClick={continuarAResumenMobile}
              className="w-full py-3.5 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-100"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {subPasoPago === 'resumen' && (
          <ResumenMobile
            fechaSeleccionada={fechaSeleccionada}
            dispSeleccionada={dispSeleccionada}
            horaApertura={horaApertura}
            horaCierre={horaCierre}
            metodoPago={metodoPago}
            precioMap={precioMap}
            getTarifaKey={getTarifaKey}
            onEditarDatos={onBack}
            onEditarPago={() => setSubPasoPago('metodo')}
            onConfirmar={onConfirmar}
            isPending={isPending}
            control={control}
          />
        )}
      </div>
    </div>
  )
}
