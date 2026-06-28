import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'

interface PageHeroProps {
  badge: string
  badgeClassName?: string
  title: ReactNode
  description: ReactNode
  accentClassName?: string
  backgroundClassName?: string
  actions?: ReactNode
}

export function PageHero({
  badge,
  badgeClassName = 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
  title,
  description,
  accentClassName = 'bg-brand-azul',
  backgroundClassName = 'bg-gradient-to-br from-brand-azul/10 via-white to-brand-menta/10',
  actions,
}: PageHeroProps) {
  return (
    <section
      className={`relative pt-24 pb-16 overflow-hidden ${backgroundClassName}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentClassName}`} />
      <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
        <Badge className={`text-sm px-4 py-1 ${badgeClassName}`}>{badge}</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
          {title}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
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
