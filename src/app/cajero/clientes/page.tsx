'use client'

import { ClientesListView } from '@/features/admin/clientes/components/views/ClientesListView'

export default function CajeroClientesPage() {
  return <ClientesListView origenCreacion="MOSTRADOR" mostrarAcciones={false} />
}
