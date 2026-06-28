import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { UsuarioAdmin } from '../types'

export interface CrearUsuarioPayload {
  nombre: string
  correo: string
  rol: string
  telefono?: string
  generarPassword: boolean
  password?: string
}

export interface CrearUsuarioResponse extends UsuarioAdmin {
  passwordTemporal?: string
}

export interface ActualizarUsuarioPayload {
  nombre: string
  telefono?: string
}

export const usuariosApi = {
  listar: async (): Promise<UsuarioAdmin[]> => {
    const { data } =
      await api.get<ApiResponse<UsuarioAdmin[]>>('/usuarios-admin')
    return data.data
  },

  crear: async (
    idSede: number,
    payload: CrearUsuarioPayload
  ): Promise<CrearUsuarioResponse> => {
    const { data } = await api.post<ApiResponse<CrearUsuarioResponse>>(
      `/usuarios-admin/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  actualizar: async (
    id: number,
    payload: ActualizarUsuarioPayload
  ): Promise<UsuarioAdmin> => {
    const { data } = await api.put<ApiResponse<UsuarioAdmin>>(
      `/usuarios-admin/${id}`,
      payload
    )
    return data.data
  },

  cambiarRol: async (id: number, nuevoRol: string): Promise<UsuarioAdmin> => {
    const { data } = await api.patch<ApiResponse<UsuarioAdmin>>(
      `/usuarios-admin/${id}/rol`,
      { nuevoRol }
    )
    return data.data
  },

  resetPassword: async (id: number): Promise<void> => {
    await api.post(`/usuarios-admin/${id}/reset-password`)
  },

  activar: async (id: number): Promise<void> => {
    await api.patch(`/usuarios-admin/${id}/activar`)
  },

  desactivar: async (id: number): Promise<void> => {
    await api.patch(`/usuarios-admin/${id}/desactivar`)
  },

  desbloquear: async (id: number): Promise<void> => {
    await api.patch(`/usuarios-admin/${id}/desbloquear`)
  },
}
