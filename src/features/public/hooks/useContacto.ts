import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { ApiResponse } from '@/types/api.types'

export interface ContactoPayload {
  nombre: string
  correo: string
  telefono?: string
  asunto?: string
  mensaje: string
}

export function useContacto() {
  return useMutation({
    mutationFn: async (payload: ContactoPayload) => {
      const response = await api.post<ApiResponse<any>>(
        '/api/v1/contacto',
        payload
      )
      return response.data.data
    },
  })
}
