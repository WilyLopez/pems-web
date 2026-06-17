import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reservasApi } from '../services/reservas.api'
import { BuscarReservasParams } from '../types'

export const RESERVAS_KEYS = {
  ADMIN_LIST: 'reservas-admin-list',
  METRICS: 'reservas-admin-metrics',
} as const

export function useReservas(params: BuscarReservasParams = {}) {
  return useQuery({
    queryKey: [RESERVAS_KEYS.ADMIN_LIST, params],
    queryFn: () => reservasApi.buscarAdmin(params),
  })
}

export function useMetricasReservas(idSede?: number, fecha?: string) {
  return useQuery({
    queryKey: [RESERVAS_KEYS.METRICS, idSede, fecha],
    queryFn: () => reservasApi.metricas(idSede, fecha),
    staleTime: 1000 * 30,
  })
}

export function useCancelarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      reservasApi.cancelar(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
      toast.success('Reserva cancelada.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo cancelar la reserva.')
    },
  })
}

export function useConfirmarIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservasApi.confirmarIngreso(id),
    onSuccess: (reserva) => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
      toast.success(`Ingreso registrado para ticket ${reserva.numeroTicket}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo registrar el ingreso.')
    },
  })
}

export function useConfirmarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservasApi.confirmarPago(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
      toast.success('Pago confirmado. Reserva en estado CONFIRMADA.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo confirmar el pago.')
    },
  })
}
