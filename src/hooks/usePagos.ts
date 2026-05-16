'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pagoService } from '@/services/pago.service'
import { RegistrarPagoPayload } from '@/types/pago.types'
import { toast } from 'sonner'
import { RESERVAS_KEY } from './useReservas'
import { EVENTOS_KEY } from './useEventos'

export function useRegistrarPagoReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegistrarPagoPayload) =>
      pagoService.registrarReserva(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESERVAS_KEY] })
      toast.success('Pago registrado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo registrar el pago.')
    },
  })
}

export function useRegistrarAdelanto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegistrarPagoPayload) =>
      pagoService.registrarAdelanto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      toast.success('Adelanto registrado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo registrar el adelanto.')
    },
  })
}
