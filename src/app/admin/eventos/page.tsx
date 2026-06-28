import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { EventosListView } from '@/features/admin/eventos/components/views/EventosListView'

function EventosPageFallback() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function EventosPage() {
  return (
    <Suspense fallback={<EventosPageFallback />}>
      <EventosListView />
    </Suspense>
  )
}
