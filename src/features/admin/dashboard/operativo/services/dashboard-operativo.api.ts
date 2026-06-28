import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { DashboardOperativo } from '../../shared/types'

export const dashboardOperativoApi = {
  obtenerResumen: async (idSede: number): Promise<DashboardOperativo> => {
    const { data } = await api.get<ApiResponse<DashboardOperativo>>(
      `/dashboard/sedes/${idSede}/resumen`
    )
    return data.data
  },
}
