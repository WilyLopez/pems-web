import api from './api'
import { ApiResponse } from '@/types/api.types'
import { RegistrarClientePayload, Cliente } from '@/types/cliente.types'
import { LoginPayload, LoginResponse, CambiarPasswordPayload } from '@/types/auth.types'

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload
    )
    return data.data
  },

  registrarCliente: async (
    payload: RegistrarClientePayload
  ): Promise<Cliente> => {
    const { data } = await api.post<ApiResponse<Cliente>>(
      '/clientes/registro',
      payload
    )
    return data.data
  },

  recuperarPassword: async (email: string): Promise<void> => {
    await api.post('/auth/recuperar-password', { email })
  },

  cambiarPasswordMe: async (payload: CambiarPasswordPayload): Promise<void> => {
    await api.patch('/usuarios/me/password', payload)
  },

  verificarCorreo: async (token: string): Promise<void> => {
    await api.get(`/clientes/verificar?token=${token}`)
  },
}
