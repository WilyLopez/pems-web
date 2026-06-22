import { cn } from '@/lib/utils'

interface DetalleRowProps {
  icon: React.ElementType
  label: string
  value?: string | null | React.ReactNode
  className?: string
}

export function DetalleRow({
  icon: Icon,
  label,
  value,
  className,
}: DetalleRowProps) {
  if (!value) return null
  return (
    <div className={cn('flex items-start gap-3 py-2.5', className)}>
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <div className="text-sm text-gray-900 mt-0.5 truncate">{value}</div>
      </div>
    </div>
  )
}
