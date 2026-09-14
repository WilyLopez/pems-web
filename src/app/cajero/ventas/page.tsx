'use client'

import { VentasListView } from '@/features/admin/ventas/components/views/VentasListView'
import { useAuth } from '@/hooks/useAuth'

export default function CajeroVentasPage() {
  const { user } = useAuth()

  return (
    <VentasListView
      hrefNuevaVenta="/cajero/ventas/nueva"
      usuarioId={user?.id}
    />
  )
}
