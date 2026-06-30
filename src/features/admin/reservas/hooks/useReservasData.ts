import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reservasApi } from '../services/reservas.api'
import { BuscarReservasParams } from '../types'

export const RESERVAS_KEYS = {
  ADMIN_LIST: 'reservas-admin-list',
  METRICS: 'reservas-admin-metrics',
  ESTADOS: 'reservas-estados',
} as const

export function useReservas(params: BuscarReservasParams = {}) {
  return useQuery({
    queryKey: [RESERVAS_KEYS.ADMIN_LIST, params],
    queryFn: () => reservasApi.buscarAdmin(params),
    placeholderData: keepPreviousData,
  })
}

export function useMetricasReservas(idSede?: number, fecha?: string) {
  return useQuery({
    queryKey: [RESERVAS_KEYS.METRICS, idSede, fecha],
    queryFn: () => reservasApi.metricas(idSede, fecha),
    staleTime: 1000 * 30,
  })
}

export function useEstadosReserva() {
  return useQuery({
    queryKey: [RESERVAS_KEYS.ESTADOS],
    queryFn: () => reservasApi.getEstados(),
    staleTime: 1000 * 60 * 60, // 1 hour
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
      toast.error(
        err?.response?.data?.mensaje ??
          err?.message ??
          'No se pudo cancelar la reserva.'
      )
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
      toast.error(
        err?.response?.data?.mensaje ??
          err?.message ??
          'No se pudo registrar el ingreso.'
      )
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
      toast.error(
        err?.response?.data?.mensaje ??
          err?.message ??
          'No se pudo confirmar el pago.'
      )
    },
  })
}

export function useEliminarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservasApi.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
      toast.success('Reserva eliminada con éxito.')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.mensaje ??
          err?.message ??
          'No se pudo eliminar la reserva.'
      )
    },
  })
}

export function useRechazarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      reservasApi.rechazarPago(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
      toast.success('Pago rechazado. Se ha notificado al cliente.')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.mensaje ??
          err?.message ??
          'No se pudo rechazar el pago.'
      )
    },
  })
}
