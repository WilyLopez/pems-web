import { Suspense } from 'react'
import {
  DashboardOperativoView,
  DashboardSkeleton,
} from '@/features/admin/dashboard'

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOperativoView />
    </Suspense>
  )
}
