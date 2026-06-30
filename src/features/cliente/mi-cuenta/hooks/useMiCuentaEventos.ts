import { useQuery } from '@tanstack/react-query'
import { eventoService } from '@/services/evento.service'
import { clienteKeys } from '../../shared/queryKeys'

export function useMiCuentaEventos(isAuthenticated: boolean, clientePerfilId?: number) {
  const query = useQuery({
    queryKey: clienteKeys.eventos.list({ page: 0, size: 50 }),
    queryFn: () => eventoService.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
  })

  return {
    eventos: query.data?.content ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
