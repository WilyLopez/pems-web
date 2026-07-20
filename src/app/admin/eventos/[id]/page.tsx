'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { EventoDetalleView } from '@/features/admin/eventos/components/views/EventoDetalleView'
import { ErrorState } from '@/components/common/Errorstate'
import { Skeleton } from '@/components/ui/Skeleton'

function EventoDetalleContent() {
  const params = useParams()
  const idEvento = Number(params.id)

  if (!Number.isInteger(idEvento) || idEvento <= 0) {
    return <ErrorState message="El identificador del evento no es válido." />
  }

  return <EventoDetalleView idEvento={idEvento} />
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
