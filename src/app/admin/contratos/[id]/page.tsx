'use client'

import { useParams } from 'next/navigation'
import { ContratoDetalleView } from '@/features/admin/contratos/components/views/ContratoDetalleView'

export default function ContratoDetallePage() {
  const params = useParams()
  return <ContratoDetalleView idContrato={parseInt(params.id as string)} />
}
