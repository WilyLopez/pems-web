import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { AuditoriaView } from '@/features/admin/auditoria/views/AuditoriaView'

function AuditoriaFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

export default function AuditoriaPage() {
  return (
    <Suspense fallback={<AuditoriaFallback />}>
      <AuditoriaView />
    </Suspense>
  )
}
