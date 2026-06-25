import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { MedioPago } from '../types'

export const configApi = {
  getMediosPago: async (): Promise<MedioPago[]> => {
    const { data } = await api.get<ApiResponse<MedioPago[]>>('/config/medios-pago')
    return data.data
  },
}
