import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-250/20', className)}
      {...props}
    />
  )
}

export function TestimoniosSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-4 rounded-full bg-brand-amarillo/20" />
            ))}
          </div>
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-5/6 bg-gray-200" />
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="w-9 h-9 rounded-full bg-gray-200" />
            <Skeleton className="h-4 w-24 bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-2/3 bg-gray-200" />
            <Skeleton className="h-5 w-5 bg-gray-250" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BannerSkeleton() {
  return (
    <Skeleton className="w-full h-[400px] md:h-[500px] rounded-3xl bg-gray-200" />
  )
}

export function PromocionesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden space-y-4 shadow-sm p-4">
          <Skeleton className="w-full h-48 rounded-2xl bg-gray-200" />
          <div className="space-y-2 px-2">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-5/6 bg-gray-250" />
            <Skeleton className="h-4 w-1/2 bg-gray-250" />
          </div>
        </div>
      ))}
    </div>
  )
}
