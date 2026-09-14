'use client'

import { VentaMostradorView } from '@/features/admin/ventas/components/views/VentaMostradorView'
import { PageHeader } from '@/components/common/PageHeader'

export default function CajeroVentaNuevaPage() {
  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        title="Nueva venta"
        description="Registro de venta presencial"
      />
      <div className="flex flex-1 flex-col justify-center">
        <VentaMostradorView
          desdeCaja
          volverCajaHref="/cajero/caja"
          hrefCaja="/cajero/caja"
        />
      </div>
    </div>
  )
}
