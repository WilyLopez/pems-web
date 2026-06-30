import api from './api'
import { ApiResponse } from '@/types/api.types'

export interface SedeIntegracion {
  proveedorCodigo: string
  apiUrl: string
  apiToken: string
  limiteMensual: number
  activo: boolean
  consultasRealizadas: number
}

export const integracionService = {
  listar: async (idSede: number): Promise<SedeIntegracion[]> => {
    const { data } = await api.get<ApiResponse<SedeIntegracion[]>>(
      `/sedes/${idSede}/integraciones`
    )
    return data.data
  },

  guardar: async (
    idSede: number,
    proveedorCodigo: string,
    payload: Omit<SedeIntegracion, 'proveedorCodigo' | 'consultasRealizadas'>
  ): Promise<void> => {
    await api.put(
      `/sedes/${idSede}/integraciones/${proveedorCodigo}`,
      payload
    )
  },
}
