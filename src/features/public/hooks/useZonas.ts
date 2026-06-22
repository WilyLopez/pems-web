import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { ZonaJuego } from '@/types/comercial.types'
import { ApiResponse } from '@/types/api.types'

export function useZonas() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.zonas,
    queryFn: async () => {
      const response = await api.get<ApiResponse<ZonaJuego[]>>('/api/v1/zonas')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
