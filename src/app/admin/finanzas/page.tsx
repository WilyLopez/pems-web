import { Suspense } from 'react'
import {
  DashboardFinancieroView,
  FinancieroSkeleton,
} from '@/features/admin/dashboard'

export default function FinanzasDashboardPage() {
  return (
    <Suspense fallback={<FinancieroSkeleton />}>
      <DashboardFinancieroView />
    </Suspense>
  )
}
