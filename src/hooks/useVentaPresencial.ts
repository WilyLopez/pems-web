import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ventaPresencialService } from '@/services/ventaPresencial.service'
import { RegistrarVentaMostradorPayload } from '@/types/ventaPresencial.types'
import { RESERVAS_KEYS } from '@/features/admin/reservas/hooks/useReservasData'

export const PRECIO_DIA_KEY = 'precio-dia'

export function usePrecioDia(idSede: number | null, fecha: string) {
  return useQuery({
    queryKey: [PRECIO_DIA_KEY, idSede, fecha],
    queryFn: () => ventaPresencialService.precioDia(idSede!, fecha),
    enabled: !!idSede && !!fecha,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRegistrarVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegistrarVentaMostradorPayload) =>
      ventaPresencialService.registrar(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
    },
  })
}

export function useMarcarEntrada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idReserva: number) =>
      ventaPresencialService.marcarEntrada(idReserva),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
    },
  })
}

export function useEditarFechaTicket() {
  return useMutation({
    mutationFn: ({ idReserva, nuevaFecha }: { idReserva: number; nuevaFecha: string }) =>
      ventaPresencialService.editarFechaTicket(idReserva, nuevaFecha),
  })
}
