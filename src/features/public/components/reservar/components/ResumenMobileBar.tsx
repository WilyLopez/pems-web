import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useWatch } from 'react-hook-form'
import { PrecioLabel } from './PrecioLabel'
import { Disponibilidad } from '@/features/admin/calendario/types'

interface ResumenMobileBarProps {
  fechaSeleccionada: string
  dispSeleccionada: Disponibilidad
  precioMap: Record<string, number> | undefined
  getTarifaKey: (fechaStr: string, esFeriado: boolean) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  control: any
}

export function ResumenMobileBar({
  fechaSeleccionada,
  dispSeleccionada,
  precioMap,
  getTarifaKey,
  control,
}: ResumenMobileBarProps) {
  const nombreNino = useWatch({ control, name: 'nombreNino' })

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] p-4 z-50 rounded-t-3xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="max-w-[70%]">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">
            Resumen de reserva
          </p>
          <p className="text-xs font-black text-gray-800 truncate mt-1 leading-none">
            {nombreNino || 'Visitante'} &middot;{' '}
            {format(parseISO(fechaSeleccionada), "d 'de' MMMM", {
              locale: es,
            })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-gray-400 leading-none">Total</p>
          <div className="mt-0.5 font-bold">
            <PrecioLabel
              tipoDia={getTarifaKey(
                fechaSeleccionada,
                dispSeleccionada.esFeriado
              )}
              precioMap={precioMap}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
