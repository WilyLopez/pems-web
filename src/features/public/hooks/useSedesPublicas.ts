import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { ApiResponse } from '@/types/api.types'

export interface SedePublica {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  departamento: string
  telefono: string | null
  correo: string | null
  activo: boolean
}

export function useSedesPublicas() {
  const { data: sedes = [], isLoading } = useQuery({
    queryKey: PUBLIC_QUERY_KEYS.sedes,
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<SedePublica[]>>('/api/v1/sedes')
      return response.data.data
    },
    staleTime: 10 * 60 * 1000,
  })

  const idSedeUnica = sedes.length === 1 ? sedes[0].id : null

  return { sedes, idSedeUnica, isLoading }
}
