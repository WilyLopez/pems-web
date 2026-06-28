'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { EventoDetalleView } from '@/features/admin/eventos/components/views/EventoDetalleView'
import { Skeleton } from '@/components/ui/Skeleton'

function EventoDetalleContent() {
  const params = useParams()
  return <EventoDetalleView idEvento={parseInt(params.id as string)} />
}

export default function EventoDetallePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <EventoDetalleContent />
    </Suspense>
  )
}
