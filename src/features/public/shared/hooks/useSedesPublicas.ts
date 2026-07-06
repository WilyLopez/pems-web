import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'
import { ApiResponse } from '@/types/api.types'

export interface SedePublica {
  id: number
  nombre: string
  ciudad: string
  departamento: string
  ruc: string | null
  latitud: number | null
  longitud: number | null
  googleMapsEmbedUrl: string | null
  activo: boolean
  fechaCreacion?: string
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

  const sedeActiva = sedes.find((s) => s.activo) ?? sedes[0] ?? null
  const idSedeActiva = sedeActiva?.id ?? null
  const idSedeUnica = sedes.length === 1 ? sedes[0].id : null

  return { sedes, sedeActiva, idSedeActiva, idSedeUnica, isLoading }
}
