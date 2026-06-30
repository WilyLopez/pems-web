import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ticket } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import Image from 'next/image'
import { PrecioLabel } from './PrecioLabel'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { MedioPago } from './PanelDetallePago'

interface ResumenSidebarProps {
  fechaSeleccionada: string | null
  dispSeleccionada: Disponibilidad | null
  horaApertura: string
  horaCierre: string
  precioMap: Record<string, number> | undefined
  getTarifaKey: (fechaStr: string, esFeriado: boolean) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  metodoPago: MedioPago | null
  control: any
}

export function ResumenSidebar({
  fechaSeleccionada,
  dispSeleccionada,
  horaApertura,
  horaCierre,
  precioMap,
  getTarifaKey,
  metodoPago,
  control,
}: ResumenSidebarProps) {
  const nombreNino = useWatch({ control, name: 'nombreNino' })
  const edadNino = useWatch({ control, name: 'edadNino' })
  const nombreAcompanante = useWatch({ control, name: 'nombreAcompanante' })
  const dniAcompanante = useWatch({ control, name: 'dniAcompanante' })

  return (
    <div className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-28 animate-fade-in">
      <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
        Resumen de Reserva
      </h3>

      {fechaSeleccionada ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Fecha Seleccionada
            </p>
            <p className="font-bold text-gray-800 capitalize text-sm">
              {format(
                parseISO(fechaSeleccionada),
                "EEEE d 'de' MMMM yyyy",
                { locale: es }
              )}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Sede Principal &middot; Horario de atención:{' '}
              {horaApertura} - {horaCierre}
            </p>
          </div>

          {dispSeleccionada && (
            <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <span className="text-xs text-gray-600 font-bold">
                Valor Entrada
              </span>
              <PrecioLabel
                tipoDia={getTarifaKey(
                  fechaSeleccionada,
                  dispSeleccionada.esFeriado
                )}
                precioMap={precioMap}
              />
            </div>
          )}

          {(nombreNino || nombreAcompanante) && (
            <div className="space-y-2.5 pt-3.5 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Datos Registrados
              </p>
              {nombreNino && (
                <div className="text-xs text-gray-700 font-semibold">
                  <span className="text-gray-400 font-medium">
                    Niño:
                  </span>{' '}
                  <strong className="text-gray-800">
                    {nombreNino}
                  </strong>
                  {edadNino !== undefined &&
                    !isNaN(Number(edadNino)) && (
                      <span className="text-gray-400">
                        {' '}
                        ({edadNino} años)
                      </span>
                    )}
                </div>
              )}
              {nombreAcompanante && (
                <div className="text-xs text-gray-700 font-semibold">
                  <span className="text-gray-400 font-medium">
                    Acompañante:
                  </span>{' '}
                  <strong className="text-gray-800">
                    {nombreAcompanante}
                  </strong>
                  {dniAcompanante && (
                    <span className="text-gray-400 font-mono text-[11px]">
                      {' '}
                      (DNI: {dniAcompanante})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {metodoPago && (
            <div className="space-y-2 pt-3.5 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Método de Pago
              </p>
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
                    <span className="text-xs font-bold text-gray-800">
                      Yape
                    </span>
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
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 font-bold">
                Total a pagar
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                Impuestos incluidos
              </p>
            </div>
            <div className="text-right">
              {fechaSeleccionada && dispSeleccionada && (
                <PrecioLabel
                  tipoDia={getTarifaKey(
                    fechaSeleccionada,
                    dispSeleccionada.esFeriado
                  )}
                  precioMap={precioMap}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-2.5">
          <Ticket className="h-10 w-10 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-400 font-bold leading-relaxed">
            Elige una fecha para ver el resumen en tiempo real de tu
            reserva.
          </p>
        </div>
      )}
    </div>
  )
}
