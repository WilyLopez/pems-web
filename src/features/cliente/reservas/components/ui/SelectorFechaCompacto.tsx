import { format, addDays, startOfDay, isBefore, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  cn,
  esFechaHoyEnZonaNegocio,
  yaPasoLaHoraEnZonaNegocio,
} from '@/lib/utils'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'

export interface SelectorFechaCompactoProps {
  idSede: number
  fechaSeleccionada: string | null
  onSelect: (fecha: string) => void
}

export function SelectorFechaCompacto({
  idSede,
  fechaSeleccionada,
  onSelect,
}: SelectorFechaCompactoProps) {
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
