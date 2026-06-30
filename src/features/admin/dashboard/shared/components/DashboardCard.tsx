import { cn } from '@/lib/utils'

export type DashboardCardVariant = 'default' | 'alert' | 'success'

const VARIANT_CLASS: Record<DashboardCardVariant, string> = {
  default: 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800',
  alert:
    'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800',
  success:
    'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
}

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DashboardCardVariant
  padded?: boolean
}

export function DashboardCard({
  variant = 'default',
  padded = true,
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border',
        VARIANT_CLASS[variant],
        padded && 'p-4 sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
