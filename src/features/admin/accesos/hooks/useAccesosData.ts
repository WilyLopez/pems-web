import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accesosApi } from '../services/accesos.api'
import { RESERVAS_KEYS } from '@/features/admin/reservas/hooks/useReservasData'

export function useMarcarEntrada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idReserva: number) => accesosApi.marcarEntrada(idReserva),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
    },
  })
}

export function useEditarFechaTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idReserva,
      nuevaFecha,
    }: {
      idReserva: number
      nuevaFecha: string
    }) => accesosApi.editarFechaTicket(idReserva, nuevaFecha),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
    },
  })
}
