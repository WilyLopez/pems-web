import type { ReactNode } from 'react'
import { BrandBadge, type BrandColor } from '@/components/ui/BrandBadge'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge?: string
  badgeColor?: BrandColor
  title: ReactNode
  description?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'center' | 'start'
  titleClassName?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  badge,
  badgeColor = 'azul',
  title,
  description,
  tone = 'light',
  align = 'center',
  titleClassName,
  action,
  className,
}: SectionHeaderProps) {
  const isDark = tone === 'dark'
  const isCenter = align === 'center'
  const titleColor = isDark ? 'text-white' : 'text-gray-900'
  const descColor = isDark ? 'text-white/80' : 'text-gray-600'

  const content = (
    <>
      {badge && (
        <BrandBadge color={badgeColor} className={isCenter ? 'mb-3' : 'mb-2'}>
          {badge}
        </BrandBadge>
      )}
      <h2 className={cn('text-3xl font-black', titleColor, titleClassName)}>
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-3 leading-relaxed',
            descColor,
            isCenter && 'max-w-2xl mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </>
  )

  if (!isCenter) {
    return (
      <div className={cn('flex items-center justify-between gap-4', className)}>
        <div>{content}</div>
        {action}
      </div>
    )
  }

  return <div className={cn('text-center', className)}>{content}</div>
}
