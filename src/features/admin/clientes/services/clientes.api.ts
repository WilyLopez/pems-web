import api from '@/services/api'
import { Cliente, ListarClientesParams, OrigenCliente } from '../types'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { ClienteFormValues } from '../schema/cliente.schema'

export interface ActualizarClientePayload {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno?: string
  telefono?: string
  correo?: string
  fechaNacimiento?: string
  aceptaComunicaciones: boolean
}

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
    payload: ClienteFormValues & { origen: OrigenCliente }
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

  activar: async (id: number): Promise<void> => {
    await api.post(`/clientes/${id}/activar`)
  },

  actualizar: async (
    id: number,
    payload: ActualizarClientePayload
  ): Promise<Cliente> => {
    const { data } = await api.put<ApiResponse<Cliente>>(
      `/clientes/${id}`,
      payload
    )
    return data.data
  },

  desactivar: async (id: number): Promise<void> => {
    await api.post(`/clientes/${id}/desactivar`)
  },
}
