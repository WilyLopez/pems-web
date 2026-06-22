// services/cliente.service.ts

import api from './api'

import {
  Cliente,
  ActualizarClientePayload,
  ListarClientesParams,
  RegistrarClienteAdminPayload,
} from '@/types/cliente.types'

import { ApiResponse, PagedResponse } from '@/types/api.types'

export const clienteService = {
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
    payload: RegistrarClienteAdminPayload
  ): Promise<Cliente> => {
    const { data } = await api.post<ApiResponse<Cliente>>(
      '/clientes/admin',
      payload
    )
    return data.data
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

  activar: async (id: number): Promise<void> => {
    await api.post(`/clientes/${id}/activar`)
  },

  desactivar: async (id: number): Promise<void> => {
    await api.post(`/clientes/${id}/desactivar`)
  },

  hacerVip: async (id: number, descuento: number): Promise<Cliente> => {
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

  actualizarSegmento: async (id: number, segmento: string): Promise<void> => {
    await api.put(`/clientes/${id}/segmento`, null, { params: { segmento } })
  },

  cambiarContrasena: async (
    id: number,
    contrasenaActual: string,
    nuevaContrasena: string
  ): Promise<void> => {
    await api.post(`/clientes/${id}/cambiar-contrasena`, {
      contrasenaActual,
      nuevaContrasena,
    })
  },

  subirFoto: async (id: number, foto: File): Promise<Cliente> => {
    const form = new FormData()
    form.append('foto', foto)
    const { data } = await api.put<ApiResponse<Cliente>>(
      `/clientes/${id}/foto`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },

  eliminarFoto: async (id: number): Promise<Cliente> => {
    const { data } = await api.delete<ApiResponse<Cliente>>(`/clientes/${id}/foto`)
    return data.data
  },

  buscarPorCorreo: async (correo: string): Promise<Cliente | null> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Cliente>>>(
      '/clientes',
      { params: { search: correo, size: 1 } }
    )
    return data.data.content?.[0] ?? null
  },
}
