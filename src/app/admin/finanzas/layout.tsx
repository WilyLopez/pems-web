'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  ingresos: 'Ingresos',
  egresos: 'Egresos',
  caja: 'Caja',
  reportes: 'Reportes',
}

const SUB_LABELS: Record<string, Record<string, string>> = {
  ingresos: { tipos: 'Tipos de ingreso' },
  egresos: { tipos: 'Tipos de egreso' },
}

function buildCrumbs(pathname: string) {
  const crumbs: { label: string; href: string; current: boolean }[] = [
    {
      label: 'Finanzas',
      href: '/admin/finanzas',
      current: pathname === '/admin/finanzas',
    },
  ]

  if (!pathname.startsWith('/admin/finanzas/')) return crumbs

  const parts = pathname.replace('/admin/finanzas/', '').split('/')
  const [section, sub] = parts

  if (section && SECTION_LABELS[section]) {
    const sectionHref = `/admin/finanzas/${section}`
    crumbs.push({
      label: SECTION_LABELS[section],
      href: sectionHref,
      current: !sub,
    })

    if (sub && SUB_LABELS[section]?.[sub]) {
      crumbs.push({
        label: SUB_LABELS[section][sub],
        href: `${sectionHref}/${sub}`,
        current: true,
      })
    }
  }

  return crumbs
}

export default function FinanzasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="breadcrumb" className="flex items-center gap-0.5">
        {crumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-0.5">
            {i > 0 && (
              <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0 text-gray-300" />
            )}
            {crumb.current ? (
              <span className="text-sm font-semibold text-gray-800">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm text-gray-400 transition-colors hover:text-gray-700"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      {children}
    </div>
  )
}
