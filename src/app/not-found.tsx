'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  const pathname = usePathname()

  const homeHref = pathname?.startsWith('/admin')
    ? '/admin'
    : pathname?.startsWith('/cliente')
    ? '/cliente'
    : '/'

  const homeLabel = pathname?.startsWith('/admin')
    ? 'Ir al panel de administración'
    : pathname?.startsWith('/cliente')
    ? 'Ir a mi panel'
    : 'Volver al inicio'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-black text-primary">404</p>
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <Button asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
