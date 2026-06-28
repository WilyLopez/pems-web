'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'

export const DASHBOARD_ADMIN_KEY = 'dashboard-admin'

export function useDashboardAdmin(idSede?: number) {
  return useQuery({
    queryKey: [DASHBOARD_ADMIN_KEY, idSede],
    queryFn: () => dashboardService.obtenerResumen(idSede!),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 2,
  })
}
