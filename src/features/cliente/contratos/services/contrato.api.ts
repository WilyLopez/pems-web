import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { ContratoCliente } from '../types'

export const contratoClienteApi = {
  obtenerPorEvento: async (idEvento: number): Promise<ContratoCliente> => {
    const { data } = await api.get<ApiResponse<ContratoCliente>>(
      `/contratos/eventos/${idEvento}`
    )
    return data.data
  },
}
