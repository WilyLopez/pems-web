'use client'

import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
          <Skeleton className="h-4 w-48" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-1.5">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
        <Skeleton className="h-4 w-44 mb-4" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
    </div>
  )
}
