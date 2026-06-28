'use client'

import { Suspense } from 'react'
import { ConfiguracionView } from '@/features/admin/configuracion/components/views/ConfiguracionView'

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 h-52 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ConfiguracionView />
    </Suspense>
  )
}
