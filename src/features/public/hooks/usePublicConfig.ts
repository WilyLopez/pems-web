import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'
import { ApiResponse } from '@/types/api.types'

export function usePublicConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.config,
    queryFn: async () => {
      const response = await api.get<ApiResponse<ConfiguracionPublica>>('/api/v1/cms/configuracion/publica')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
