import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
}: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [
        {
          label: 'Inicio',
          href: '/admin/dashboard',
          icon: <Home className="h-3 w-3" />,
        },
        ...items,
      ]
    : items

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 flex-wrap', className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1

        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            )}

            {isLast ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  'bg-brand-azul/10 text-brand-azul border border-brand-azul/20'
                )}
                aria-current="page"
              >
                {item.icon}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  'bg-muted text-muted-foreground border border-transparent',
                  'hover:bg-muted/80 hover:text-foreground transition-colors'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  'bg-muted text-muted-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
