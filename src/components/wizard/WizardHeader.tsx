'use client'

import Image from 'next/image'
import { X, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimerPhase } from '@/hooks/useWizardTimer'

interface WizardHeaderProps {
  titulo: string
  secondsLeft: number
  timerProgress: number
  timerPhase: TimerPhase
  timerDisplay: string
  paso?: number
  total?: number
  onSalir?: () => void
  className?: string
}

const phaseStyles: Record<
  TimerPhase,
  { bar: string; text: string; icon: string }
> = {
  safe: { bar: 'bg-green-500', text: 'text-green-700', icon: 'text-green-600' },
  warning: {
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    icon: 'text-amber-600',
  },
  critical: { bar: 'bg-red-500', text: 'text-red-700', icon: 'text-red-600' },
  expired: { bar: 'bg-red-600', text: 'text-red-800', icon: 'text-red-700' },
}

export function WizardHeader({
  titulo,
  secondsLeft,
  timerProgress,
  timerPhase,
  timerDisplay,
  paso,
  total,
  onSalir,
  className,
}: WizardHeaderProps) {
  const styles = phaseStyles[timerPhase]
  const showWarning = timerPhase === 'warning' || timerPhase === 'critical'
  const showDots = paso !== undefined && total !== undefined

  return (
    <div
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm',
        className
      )}
    >
      <div className="h-1 w-full bg-gray-100 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear',
            styles.bar,
            timerPhase === 'critical' && 'animate-pulse'
          )}
          style={{ width: `${timerProgress * 100}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-secundario.png"
            alt="Kiki y Lala"
            width={90}
            height={36}
            className="h-8 w-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="hidden sm:block h-5 w-px bg-gray-200" />
          <span className="hidden sm:block text-sm font-semibold text-gray-600">
            {titulo}
          </span>
        </div>

        {showDots && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i < paso!
                      ? 'bg-brand-rosa w-6'
                      : i === paso! - 1
                        ? 'bg-brand-rosa w-8'
                        : 'bg-gray-200 w-4'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {paso} / {total}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div
            className={cn(
              'hidden sm:flex items-center gap-1.5 text-xs font-bold',
              styles.text
            )}
          >
            {showWarning ? (
              <AlertTriangle
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  styles.icon,
                  timerPhase === 'critical' && 'animate-pulse'
                )}
              />
            ) : (
              <Clock className={cn('h-3.5 w-3.5 shrink-0', styles.icon)} />
            )}
            <span>{timerDisplay}</span>
          </div>
          {showWarning && (
            <div
              className={cn(
                'flex sm:hidden items-center gap-1 text-xs font-bold',
                styles.text
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-3.5 w-3.5',
                  styles.icon,
                  timerPhase === 'critical' && 'animate-pulse'
                )}
              />
              <span>{timerDisplay}</span>
            </div>
          )}

          {onSalir && (
            <button
              onClick={onSalir}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Salir"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
