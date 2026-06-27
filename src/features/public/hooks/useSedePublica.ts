import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { ApiResponse } from '@/types/api.types'
import { Sede } from '@/types/configuracion.types'

export function useSedePublica() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.sedes,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Sede[]>>('/sedes')
      const sedes = response.data.data
      return sedes.find((s) => s.activo) ?? sedes[0] ?? null
    },
    staleTime: 5 * 60 * 1000,
  })
}
