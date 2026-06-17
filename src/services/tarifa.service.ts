import api from './api'
import { ApiResponse } from '@/types/api.types'
import { Tarifa } from '@/types/calendario.types'

export interface PrecioPublico {
  tipoDia: string
  descripcion: string
  precio: number
}

export interface ConfigurarTarifaPayload {
  tipoDia: string
  precio: number
  vigenciaDesde: string
  vigenciaHasta?: string
}

export const tarifaService = {
  listarActivas: async (idSede: number): Promise<Tarifa[]> => {
    const { data } = await api.get<ApiResponse<Tarifa[]>>(`/tarifas/sedes/${idSede}/activas`)
    return data.data
  },

  configurar: async (idSede: number, payload: ConfigurarTarifaPayload): Promise<void> => {
    await api.post(`/tarifas/sedes/${idSede}`, payload)
  },

  preciosPublicos: async (idSede: number): Promise<PrecioPublico[]> => {
    const { data } = await api.get<ApiResponse<PrecioPublico[]>>(`/tarifas/sedes/${idSede}/precios`)
    return data.data
  },
}
