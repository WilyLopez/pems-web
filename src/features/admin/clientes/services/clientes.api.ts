import api from '@/services/api'
import { Cliente, ListarClientesParams } from '../types'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { ClienteFormValues } from '../schema/cliente.schema'

export const clientesApi = {
  listar: async (
    params: ListarClientesParams = {}
  ): Promise<PagedResponse<Cliente>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Cliente>>>(
      '/clientes',
      { params }
    )
    return data.data
  },

  obtener: async (id: number): Promise<Cliente> => {
    const { data } = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`)
    return data.data
  },

  registrarAdmin: async (
    payload: ClienteFormValues & { origen: 'ADMIN' }
  ): Promise<Cliente> => {
    const sanitized = {
      ...payload,
      correo: payload.correo || undefined,
      apellidoMaterno: payload.apellidoMaterno || undefined,
      telefono: payload.telefono || undefined,
    }
    const { data } = await api.post<ApiResponse<Cliente>>(
      '/clientes/admin',
      sanitized
    )
    return data.data
  },

  hacerVip: async (id: number, descuento: number = 10): Promise<Cliente> => {
    const { data } = await api.post<ApiResponse<Cliente>>(
      `/clientes/${id}/vip?descuento=${descuento}`
    )
    return data.data
  },

  quitarVip: async (id: number): Promise<Cliente> => {
    const { data } = await api.delete<ApiResponse<Cliente>>(
      `/clientes/${id}/vip`
    )
    return data.data
  },

  registrarVisita: async (id: number): Promise<void> => {
    await api.post(`/clientes/${id}/visitas`)
  },
}
