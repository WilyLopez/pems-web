'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { VentaMostradorView } from '@/features/admin/ventas/components/views/VentaMostradorView'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'

export default function NuevaVentaPage() {
  const searchParams = useSearchParams()
  const desdeCaja = searchParams.get('from') === 'caja'

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          ...(desdeCaja
            ? [{ label: 'Caja', href: '/admin/finanzas/caja' }]
            : [{ label: 'Ventas', href: '/admin/ventas' }]),
          { label: 'Nueva Venta' },
        ]}
      />
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Nueva Venta en Caja"
          description="Registro de venta presencial"
        />
        {desdeCaja && (
          <Button asChild variant="outline" className="shrink-0 gap-1.5">
            <Link href="/admin/finanzas/caja">
              <ArrowLeft className="h-4 w-4" />
              Volver a caja
            </Link>
          </Button>
        )}
      </div>
      <VentaMostradorView desdeCaja={desdeCaja} />
    </div>
  )
}
