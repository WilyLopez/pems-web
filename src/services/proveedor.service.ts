import api from './api'
import { ApiResponse } from '@/types/api.types'

export interface Proveedor {
  id: number
  nombre: string
  ruc?: string
  contactoNombre?: string
  contactoTelefono?: string
  contactoCorreo?: string
  tipoServicio: string
  activo: boolean
  fechaCreacion: string
}

export interface GestionarProveedorPayload {
  nombre: string
  ruc?: string
  contactoNombre?: string
  contactoTelefono?: string
  contactoCorreo?: string
  tipoServicio: string
  notas?: string
}

export const proveedorService = {
  listar: async (): Promise<Proveedor[]> => {
    const { data } = await api.get<ApiResponse<Proveedor[]>>('/proveedores')
    return data.data
  },

  crear: async (payload: GestionarProveedorPayload): Promise<Proveedor> => {
    const { data } = await api.post<ApiResponse<Proveedor>>(
      '/proveedores',
      payload
    )
    return data.data
  },

  actualizar: async (
    id: number,
    payload: GestionarProveedorPayload
  ): Promise<Proveedor> => {
    const { data } = await api.put<ApiResponse<Proveedor>>(
      `/proveedores/${id}`,
      payload
    )
    return data.data
  },

  desactivar: async (id: number): Promise<void> => {
    await api.delete(`/proveedores/${id}/desactivar`)
  },
}
