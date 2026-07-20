'use client'

import { Suspense } from 'react'
import { NuevoEventoForm } from '@/features/admin/eventos/components/forms/NuevoEventoForm'
import { Skeleton } from '@/components/ui/Skeleton'

export default function NuevoEventoFormularioPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <NuevoEventoForm />
    </Suspense>
  )
}
