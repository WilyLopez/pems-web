import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  mensaje: string
  icon?: LucideIcon
  detalle?: string
  className?: string
}

export function EmptyState({
  mensaje,
  icon: Icon,
  detalle,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 text-center',
        className
      )}
    >
      {Icon && (
        <Icon className="mb-2 h-10 w-10 text-gray-200 dark:text-gray-700" />
      )}
      <p className="text-sm text-gray-400 dark:text-gray-500">{mensaje}</p>
      {detalle && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
          {detalle}
        </p>
      )}
    </div>
  )
}
