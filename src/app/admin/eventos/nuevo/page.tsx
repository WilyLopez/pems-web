'use client'

import { Suspense } from 'react'
import { NuevoEventoView } from '@/features/admin/eventos/components/views/NuevoEventoView'
import { Skeleton } from '@/components/ui/Skeleton'

export default function NuevoEventoPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <NuevoEventoView />
    </Suspense>
  )
}
