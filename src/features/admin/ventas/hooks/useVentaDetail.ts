import { useQuery } from '@tanstack/react-query'
import { ventasApi } from '../services/ventas.api'
import { VENTAS_KEYS } from './useVentasData'

export function useVentaDetail(id: number | null) {
  return useQuery({
    queryKey: [VENTAS_KEYS.DETAIL, id],
    queryFn: () => ventasApi.obtenerDetalle(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
