import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  reservaService,
  BuscarReservasParams,
} from '@/services/reserva.service'

export const RESERVAS_KEY = 'reservas'
export const RESERVAS_ADM_KEY = 'reservas-admin'
export const METRICAS_KEY = 'metricas-reservas'

export function useReservas(params: BuscarReservasParams = {}) {
  return useQuery({
    queryKey: [RESERVAS_ADM_KEY, params],
    queryFn: () => reservaService.buscarAdmin(params),
  })
}

export function useMetricasReservas(idSede?: number, fecha?: string) {
  return useQuery({
    queryKey: [METRICAS_KEY, idSede, fecha],
    queryFn: () => reservaService.metricas(idSede, fecha),
    staleTime: 1000 * 30,
  })
}

export function useCancelarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      reservaService.cancelar(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_ADM_KEY] })
      qc.invalidateQueries({ queryKey: [METRICAS_KEY] })
      toast.success('Reserva cancelada.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cancelar la reserva.'),
  })
}

export function useConfirmarIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservaService.confirmarIngreso(id),
    onSuccess: (reserva) => {
      qc.invalidateQueries({ queryKey: [RESERVAS_ADM_KEY] })
      qc.invalidateQueries({ queryKey: [METRICAS_KEY] })
      toast.success(`Ingreso registrado para ticket ${reserva.numeroTicket}`)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo registrar el ingreso.'),
  })
}

export function useConfirmarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservaService.confirmarPago(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_ADM_KEY] })
      qc.invalidateQueries({ queryKey: [METRICAS_KEY] })
      toast.success('Pago confirmado. Reserva en estado CONFIRMADA.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo confirmar el pago.'),
  })
}

export function useReprogramarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nuevaFecha }: { id: number; nuevaFecha: string }) =>
      reservaService.reprogramar(id, { nuevaFechaEvento: nuevaFecha }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_ADM_KEY] })
      toast.success('Reserva reprogramada correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo reprogramar la reserva.'),
  })
}
