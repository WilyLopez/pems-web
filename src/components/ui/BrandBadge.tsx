import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'

export type BrandColor = 'azul' | 'rosa' | 'amarillo' | 'menta'

const COLOR_CLASSES: Record<BrandColor, string> = {
  azul: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
  rosa: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20',
  amarillo: 'bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30',
  menta: 'bg-brand-menta/20 text-emerald-700 border-brand-menta/30',
}

interface BrandBadgeProps {
  color?: BrandColor
  className?: string
  children: ReactNode
}

export function BrandBadge({
  color = 'azul',
  className,
  children,
}: BrandBadgeProps) {
  return (
    <Badge className={cn(COLOR_CLASSES[color], className)}>{children}</Badge>
  )
}
