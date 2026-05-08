import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Cliente, ActualizarClientePayload } from '@/types/cliente.types'

export const clienteService = {
  listar: async (params: {
    page?: number
    size?: number
    search?: string
  }): Promise<PagedResponse<Cliente>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Cliente>>>('/clientes', { params })
    return data.data
  },

  obtener: async (id: number): Promise<Cliente> => {
    const { data } = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`)
    return data.data
  },

  actualizar: async (id: number, payload: ActualizarClientePayload): Promise<Cliente> => {
    const { data } = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, payload)
    return data.data
  },
}