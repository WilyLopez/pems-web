'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservaService } from '@/services/reserva.service'
import { toast } from 'sonner'
import { CrearReservaPayload } from '@/types/reserva.types'

export const RESERVAS_KEY = 'reservas'

export function useReservas(params: {
  page?: number
  size?: number
  estado?: string
  idSede?: number
  fecha?: string
} = {}) {
  return useQuery({
    queryKey: [RESERVAS_KEY, params],
    queryFn: () => reservaService.listar(params),
  })
}

export function useCancelarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      reservaService.cancelar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESERVAS_KEY] })
      toast.success('Reserva cancelada correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo cancelar la reserva.')
    },
  })
}

export function useReprogramarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nuevaFecha }: { id: number; nuevaFecha: string }) =>
      reservaService.reprogramar(id, { nuevaFechaEvento: nuevaFecha }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESERVAS_KEY] })
      toast.success('Reserva reprogramada correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo reprogramar la reserva.')
    },
  })
}