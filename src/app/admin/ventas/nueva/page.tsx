import { VentaMostradorView } from '@/features/admin/ventas/components/views/VentaMostradorView'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'

export default function NuevaVentaPage() {
  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Ventas', href: '/admin/ventas' },
          { label: 'Nueva Venta' },
        ]}
      />
      <PageHeader
        title="Nueva Venta en Caja"
        description="Registro de venta presencial"
      />
      <VentaMostradorView />
    </div>
  )
}
