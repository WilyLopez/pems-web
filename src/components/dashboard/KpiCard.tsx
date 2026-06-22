import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: number
  className?: string
}

export function KpiCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}% vs mes anterior
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
