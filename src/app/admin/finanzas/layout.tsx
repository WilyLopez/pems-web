'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  TrendingUp,
  ArrowUpCircle,
  Tag,
  ArrowDownCircle,
  Tags,
  Landmark,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Dashboard',       href: '/admin/finanzas',               icon: TrendingUp,    exact: true },
  { label: 'Ingresos',        href: '/admin/finanzas/ingresos',      icon: ArrowUpCircle, exact: true  },
  { label: 'Tipos ingreso',   href: '/admin/finanzas/ingresos/tipos', icon: Tag,           exact: false },
  { label: 'Egresos',         href: '/admin/finanzas/egresos',       icon: ArrowDownCircle, exact: false },
  { label: 'Tipos egreso',    href: '/admin/finanzas/tipos-egreso',  icon: Tags,          exact: false },
  { label: 'Caja',            href: '/admin/finanzas/caja',          icon: Landmark,      exact: false },
  { label: 'Reportes',        href: '/admin/finanzas/reportes',      icon: BarChart3,     exact: false },
]

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
        {tabs.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-azul text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-azul'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
