import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardCard } from './DashboardCard'
import { KpiDelta } from './KpiDelta'

interface KpiCardProps {
  label: string
  valor: number | string
  icon: LucideIcon
  iconClassName?: string
  valorClassName?: string
  detalle?: string
  variacion?: number | null
  invertirColor?: boolean
  children?: React.ReactNode
}

export function KpiCard({
  label,
  valor,
  icon: Icon,
  iconClassName,
  valorClassName,
  detalle,
  variacion,
  invertirColor,
  children,
}: KpiCardProps) {
  return (
    <DashboardCard padded={false}>
      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-gray-400 sm:text-xs dark:text-gray-500">
            {label}
          </span>
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8',
              iconClassName ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p
            className={cn(
              'text-lg font-black leading-none tabular-nums sm:text-2xl',
              valorClassName ?? 'text-gray-900 dark:text-gray-100'
            )}
          >
            {valor}
          </p>
          <KpiDelta variacion={variacion} invertirColor={invertirColor} />
        </div>
        {detalle && (
          <p className="mt-1.5 text-[11px] leading-tight text-gray-400 sm:text-xs dark:text-gray-500">
            {detalle}
          </p>
        )}
        {children}
      </div>
    </DashboardCard>
  )
}
