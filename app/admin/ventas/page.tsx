import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'Ventas' }

export default function VentasPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ventas"
        description="Historial y registro de ventas de productos"
        actions={
          <Button size="sm" asChild>
            <Link href="/admin/ventas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva venta
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Historial de ventas — próximamente
        </CardContent>
      </Card>
    </div>
  )
}