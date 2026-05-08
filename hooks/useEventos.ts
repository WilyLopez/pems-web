'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventoService } from '@/services/evento.service'
import { toast } from 'sonner'

export const EVENTOS_KEY = 'eventos'

export function useEventos(params: {
  page?: number
  size?: number
  estado?: string
  idSede?: number
} = {}) {
  return useQuery({
    queryKey: [EVENTOS_KEY, params],
    queryFn: () => eventoService.listar(params),
  })
}

export function useEvento(id: number) {
  return useQuery({
    queryKey: [EVENTOS_KEY, id],
    queryFn: () => eventoService.obtener(id),
    enabled: !!id,
  })
}

export function useConfirmarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, precioTotal }: { id: number; precioTotal: number }) =>
      eventoService.confirmar(id, precioTotal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      toast.success('Evento confirmado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo confirmar el evento.')
    },
  })
}

export function useCancelarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      eventoService.cancelar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      toast.success('Evento cancelado.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo cancelar el evento.')
    },
  })
}