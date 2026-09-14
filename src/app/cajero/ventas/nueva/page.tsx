'use client'

import { VentaMostradorView } from '@/features/admin/ventas/components/views/VentaMostradorView'
import { PageHeader } from '@/components/common/PageHeader'

export default function CajeroVentaNuevaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Nueva venta"
        description="Registro de venta presencial"
      />
      <VentaMostradorView
        desdeCaja
        volverCajaHref="/cajero/caja"
        hrefCaja="/cajero/caja"
      />
    </div>
  )
}
