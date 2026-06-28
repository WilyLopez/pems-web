import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiDeltaProps {
  variacion?: number | null
  invertirColor?: boolean
  className?: string
}

export function KpiDelta({
  variacion,
  invertirColor = false,
  className,
}: KpiDeltaProps) {
  if (variacion === null || variacion === undefined) return null

  const esNeutro = variacion === 0
  const esPositivo = variacion > 0
  const esBueno = invertirColor ? !esPositivo : esPositivo

  const Icon = esNeutro ? Minus : esPositivo ? ArrowUpRight : ArrowDownRight

  const colorClass = esNeutro
    ? 'text-gray-400 dark:text-gray-500'
    : esBueno
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-bold tabular-nums',
        colorClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(variacion)}%
    </span>
  )
}
