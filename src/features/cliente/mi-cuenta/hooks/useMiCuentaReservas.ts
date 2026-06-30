import { useQuery } from '@tanstack/react-query'
import { reservaApi } from '@/features/cliente/shared/services/reserva.api'
import { clienteKeys } from '../../shared/queryKeys'

export function useMiCuentaReservas(isAuthenticated: boolean, clientePerfilId?: number) {
  const query = useQuery({
    queryKey: clienteKeys.reservas.list({ page: 0, size: 50 }),
    queryFn: () => reservaApi.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
  })

  return {
    reservas: query.data?.content ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
