import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservaApi } from '@/features/cliente/shared/services/reserva.api'
import { getEstadoEfectivo } from '@/features/cliente/shared/utils/reserva'
import { clienteKeys } from '../../shared/queryKeys'
import { toast } from 'sonner'

export function useMisReservasData(isAuthenticated: boolean) {
  const queryClient = useQueryClient()

  const reservasQuery = useQuery({
    queryKey: clienteKeys.reservas.list({ page: 0, size: 50 }),
    queryFn: () => reservaApi.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated,
  })

  const reprogramarMutation = useMutation({
    mutationFn: ({ id, nuevaFecha }: { id: number; nuevaFecha: string }) =>
      reservaApi.reprogramar(id, nuevaFecha),
    onSuccess: () => {
      toast.success('Reserva reprogramada exitosamente.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.reservas.all })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo reprogramar la reserva.')
    },
  })

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      reservaApi.cancelar(id, motivo),
    onSuccess: () => {
      toast.success('Reserva cancelada.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.reservas.all })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo cancelar la reserva.')
    },
  })

  return {
    reservas: (reservasQuery.data?.content ?? []).map((r) => ({
      ...r,
      estado: getEstadoEfectivo(r) as any,
    })),
    isLoading: reservasQuery.isLoading,
    isError: reservasQuery.isError,
    refetch: reservasQuery.refetch,
    reprogramar: reprogramarMutation.mutateAsync,
    isReprogramando: reprogramarMutation.isPending,
    cancelar: cancelarMutation.mutateAsync,
    isCancelando: cancelarMutation.isPending,
  }
}
