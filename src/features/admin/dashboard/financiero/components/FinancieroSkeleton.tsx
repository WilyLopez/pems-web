'use client'

import { Skeleton } from '@/components/ui/Skeleton'

const SURFACE =
  'rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'

export function FinancieroSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${SURFACE} h-32 p-5`} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${SURFACE} space-y-3 p-5`}>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
