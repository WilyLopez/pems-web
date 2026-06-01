import api from './api'
import { ApiResponse } from '@/types/api.types'
import { DashboardAdmin } from '@/types/dashboard.types'

export const dashboardService = {
  obtenerResumen: (idSede: number): Promise<DashboardAdmin> =>
    api
      .get<ApiResponse<DashboardAdmin>>(`/dashboard/sedes/${idSede}/resumen`)
      .then((r) => r.data.data),
}
