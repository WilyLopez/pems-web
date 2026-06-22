import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { ApiResponse } from '@/types/api.types'

export interface PrecioPublicoResponse {
  tipoDia: string
  descripcion: string
  precio: number
}

export function usePublicPrecios(idSede = 1) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.precios, idSede],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PrecioPublicoResponse[]>>(`/api/v1/tarifas/sedes/${idSede}/precios`)
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
