import React from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Loader2, AlertCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatCurrency, cn } from '@/lib/utils'
import { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'

interface FechaVisitaSectionProps {
  register: UseFormRegister<VentaMostradorFormValues>
  fechaVisita: string
  diasMaxFecha: number
  isLoadingDisp: boolean
  plazasDisponibles?: number
  estaBloqueado: boolean
  esHoy: boolean
  precioDia: any
  fueraDeHorario: boolean
  confCal: any
  disponibilidad: any
}

export const FechaVisitaSection = ({
  register,
  fechaVisita,
  diasMaxFecha,
  isLoadingDisp,
  plazasDisponibles,
  estaBloqueado,
  esHoy,
  precioDia,
  fueraDeHorario,
  confCal,
  disponibilidad,
}: FechaVisitaSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
            Fecha de visita
          </Label>
          <div className="relative">
            <Input
              type="date"
              {...register('fechaVisita')}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(
                addDays(new Date(), diasMaxFecha),
                'yyyy-MM-dd'
              )}
              className={cn(
                'h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                estaBloqueado && 'border-red-500 dark:border-red-600'
              )}
            />
            {isLoadingDisp && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full',
                esHoy
                  ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
              )}
            >
              {esHoy ? 'Visita hoy: ingreso inmediato' : 'Visita anticipada'}
            </span>
            {plazasDisponibles != null && !estaBloqueado && (
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                {plazasDisponibles} lugar{plazasDisponibles !== 1 ? 'es' : ''} disponible{plazasDisponibles !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {precioDia && !estaBloqueado && (
          <div className="flex flex-col justify-end pb-1">
            <span className="text-[10px] font-bold text-brand-azul uppercase">
              Precio base: {formatCurrency(precioDia.precio)}
            </span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500">
              {precioDia.tipoDia === 'FIN_SEMANA_FERIADO'
                ? 'Fin de Semana / Feriado'
                : precioDia.tipoDia === 'SEMANA'
                  ? 'Día de Semana'
                  : precioDia.tipoDia}
            </span>
          </div>
        )}
      </div>

      {precioDia && precioDia.precio === 0 && !estaBloqueado && (
        <Alert
          variant="destructive"
          className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold">
            Sin tarifa configurada
          </AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">
            No hay tarifa activa para esta fecha. Configura una tarifa antes de registrar la venta.
          </AlertDescription>
        </Alert>
      )}

      {estaBloqueado && (
        <Alert
          variant="destructive"
          className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold">
            Fecha no disponible
          </AlertTitle>
          <AlertDescription className="text-[10px] leading-tight">
            {fueraDeHorario
              ? `El local ya se encuentra cerrado para ventas hoy. Hora de cierre: ${confCal?.turnoT2Fin}`
              : disponibilidad?.motivoBloqueo ||
                'Esta fecha se encuentra bloqueada para la venta de entradas.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
