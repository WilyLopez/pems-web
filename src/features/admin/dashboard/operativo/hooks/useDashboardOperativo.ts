'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardOperativoApi } from '../services/dashboard-operativo.api'
import { DASHBOARD_OPERATIVO_QUERY_KEY, DASHBOARD_REFETCH } from '../config'
import { enHorarioOperacion } from '../utils/kpi-helpers'

function intervaloRefetch(): number {
  return enHorarioOperacion(new Date().getHours())
    ? DASHBOARD_REFETCH.intervaloEnOperacionMs
    : DASHBOARD_REFETCH.intervaloFueraOperacionMs
}

export function useDashboardOperativo(idSede?: number) {
  return useQuery({
    queryKey: [DASHBOARD_OPERATIVO_QUERY_KEY, idSede],
    queryFn: () => dashboardOperativoApi.obtenerResumen(idSede!),
    enabled: !!idSede,
    staleTime: DASHBOARD_REFETCH.staleTimeMs,
    refetchInterval: () => intervaloRefetch(),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })
}
