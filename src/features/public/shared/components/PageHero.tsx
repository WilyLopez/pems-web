import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { BrandBadge, type BrandColor } from '@/components/ui/BrandBadge'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  tone?: 'light' | 'dark'
  badge?: string
  badgeColor?: BrandColor
  icon?: LucideIcon
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
  accentClassName?: string
  backgroundClassName?: string
  containerClassName?: string
}

export function PageHero({
  tone = 'light',
  badge,
  badgeColor = 'azul',
  icon: Icon,
  title,
  description,
  actions,
  accentClassName,
  backgroundClassName,
  containerClassName = 'max-w-6xl',
}: PageHeroProps) {
  const isDark = tone === 'dark'
  const background =
    backgroundClassName ??
    (isDark
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
      : 'bg-gradient-to-br from-brand-azul/10 via-white to-brand-menta/10')

  return (
    <section className={cn('relative pt-24 pb-16 overflow-hidden', background)}>
      {accentClassName && (
        <div
          className={cn('absolute top-0 left-0 right-0 h-1', accentClassName)}
        />
      )}

      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-brand-rosa/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
        </div>
      )}

      <div
        className={cn(
          'container mx-auto px-4 text-center space-y-5 relative',
          containerClassName
        )}
      >
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
            <Icon className="h-8 w-8 text-white" />
          </div>
        )}

        {badge && (
          <BrandBadge color={badgeColor} className="text-sm px-4 py-1">
            {badge}
          </BrandBadge>
        )}

        <h1
          className={cn(
            'text-4xl sm:text-5xl font-black leading-tight max-w-3xl mx-auto',
            !isDark && 'text-gray-900'
          )}
        >
          {title}
        </h1>

        <p
          className={cn(
            'text-lg max-w-2xl mx-auto leading-relaxed',
            isDark ? 'text-white/70' : 'text-gray-600'
          )}
        >
          {description}
        </p>

        {actions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  )
}
