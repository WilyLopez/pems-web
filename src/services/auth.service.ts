import api from './api'
import { ApiResponse } from '@/types/api.types'
import { RegistrarClientePayload, Cliente } from '@/types/cliente.types'

export const authService = {
  registrarCliente: async (
    payload: RegistrarClientePayload
  ): Promise<Cliente> => {
    const { data } = await api.post<ApiResponse<Cliente>>(
      '/clientes/registro',
      payload
    )
    return data.data
  },

  verificarCorreo: async (token: string): Promise<void> => {
    await api.get(`/clientes/verificar?token=${token}`)
  },
}
