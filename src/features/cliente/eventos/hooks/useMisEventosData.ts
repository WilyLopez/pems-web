import { useQuery } from '@tanstack/react-query'
import { eventoService } from '@/services/evento.service'
import { clienteKeys } from '../../shared/queryKeys'

export function useMisEventosData(isAuthenticated: boolean) {
  const eventosQuery = useQuery({
    queryKey: clienteKeys.eventos.list({ page: 0, size: 30 }),
    queryFn: () => eventoService.listar({ page: 0, size: 30 }),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  return {
    eventos: eventosQuery.data?.content ?? [],
    isLoading: eventosQuery.isLoading,
    isError: eventosQuery.isError,
    refetch: eventosQuery.refetch,
  }
}

export function useDetalleEventoData(id: number) {
  return useQuery({
    queryKey: clienteKeys.eventos.detalle(id),
    queryFn: () => eventoService.obtener(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
