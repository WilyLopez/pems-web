'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfiguracionPublicaView } from '@/features/admin/cms/configuracion-publica/views/ConfiguracionPublicaView'

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 rounded" />
      <div className="flex gap-5">
        <Skeleton className="h-80 w-48 rounded-xl shrink-0" />
        <Skeleton className="h-80 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export default function ConfiguracionPublicaPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ConfiguracionPublicaView />
    </Suspense>
  )
}
