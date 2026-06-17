import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'

export interface FidelizacionConfig {
  id?: number
  idSede: number
  umbral: number
  updatedAt?: string
}

export const fidelizacionApi = {
  obtenerConfig: async (idSede: number): Promise<FidelizacionConfig> => {
    const { data } = await api.get<ApiResponse<FidelizacionConfig>>(
      `/fidelizacion/config/sedes/${idSede}`
    )
    return data.data
  },

  actualizarConfig: async (
    idSede: number,
    umbral: number
  ): Promise<FidelizacionConfig> => {
    const { data } = await api.put<ApiResponse<FidelizacionConfig>>(
      `/fidelizacion/config/sedes/${idSede}`,
      { umbral }
    )
    return data.data
  },
}
