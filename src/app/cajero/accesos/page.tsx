'use client'

import { AccesoPublicoView } from '@/features/admin/accesos/components/public/AccesoPublicoView'
import { PageHeader } from '@/components/common/PageHeader'

export default function CajeroAccesosPage() {
  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        title="Control de acceso"
        description="Escaneo de tickets y registro de ingreso al establecimiento"
      />
      <div className="flex flex-1 flex-col justify-center">
        <AccesoPublicoView puedeReprogramar={false} />
      </div>
    </div>
  )
}
