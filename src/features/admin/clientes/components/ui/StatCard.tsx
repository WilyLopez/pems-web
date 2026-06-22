import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  className?: string
  size?: 'sm' | 'md'
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  className,
  size = 'md',
}: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1', className)}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className={cn('font-black text-gray-900', size === 'md' ? 'text-lg' : 'text-base')}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
