import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PasoReserva = 1 | 2 | 3 | 4

interface StepIndicatorProps {
  paso: PasoReserva
}

export function StepIndicator({ paso }: StepIndicatorProps) {
  const pasos = [
    { n: 1, label: 'Fecha', desc: 'Elige tu día' },
    { n: 2, label: 'Visitante', desc: 'Niño y acompañante' },
    { n: 3, label: 'Pago', desc: 'Completa la reserva' },
  ]

  if (paso === 4) return null

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 mb-6">
      <div className="flex md:hidden items-center justify-between gap-2">
        {pasos.map((p, i) => {
          const isActive = paso === p.n
          const isCompleted = paso > p.n

          return (
            <div key={p.n} className="flex-1 flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all duration-300 shadow-sm text-xs shrink-0',
                    isCompleted
                      ? 'bg-green-500 text-white shadow-green-100'
                      : isActive
                        ? 'bg-brand-azul text-white shadow-blue-100'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : p.n}
                </div>
                {isActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-azul leading-none truncate max-w-[80px]">
                    {p.label}
                  </span>
                )}
              </div>

              {i < pasos.length - 1 && (
                <div className="flex-1 h-[2px] bg-gray-100 rounded-full overflow-hidden min-w-[12px]">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isCompleted ? 'bg-green-500 w-full' : 'bg-gray-100 w-0'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="hidden md:flex flex-row items-center justify-between gap-2">
        {pasos.map((p, i) => {
          const isActive = paso === p.n
          const isCompleted = paso > p.n

          return (
            <div key={p.n} className="flex-1 flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shadow-sm text-sm shrink-0',
                    isCompleted
                      ? 'bg-green-500 text-white shadow-green-100'
                      : isActive
                        ? 'bg-brand-azul text-white shadow-blue-100 scale-105'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : p.n}
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      'text-xs font-black uppercase tracking-wider leading-none',
                      isActive
                        ? 'text-brand-azul'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                    )}
                  >
                    {p.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {p.desc}
                  </p>
                </div>
              </div>

              {i < pasos.length - 1 && (
                <div className="flex-1 h-[2px] mx-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isCompleted ? 'bg-green-500 w-full' : 'bg-gray-100 w-0'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
