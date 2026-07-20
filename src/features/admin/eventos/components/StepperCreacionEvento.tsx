import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperCreacionEventoProps {
  pasoActual: 1 | 2
}

const PASOS = [
  { numero: 1, label: 'Fecha y turno' },
  { numero: 2, label: 'Datos del evento' },
] as const

export function StepperCreacionEvento({
  pasoActual,
}: StepperCreacionEventoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Paso 1 de 2">
      {PASOS.map((paso, index) => {
        const completado = paso.numero < pasoActual
        const activo = paso.numero === pasoActual
        return (
          <div key={paso.numero} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  completado
                    ? 'bg-brand-azul text-white'
                    : activo
                      ? 'bg-brand-rosa text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                )}
              >
                {completado ? <Check className="h-3 w-3" /> : paso.numero}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold',
                  activo
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {paso.label}
              </span>
            </div>
            {index < PASOS.length - 1 && (
              <div className="h-px w-6 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        )
      })}
    </div>
  )
}
