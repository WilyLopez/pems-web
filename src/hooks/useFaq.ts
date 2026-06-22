'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { faqService } from '@/services/faq.service'
import { CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'

export const FAQ_KEY = ['faqs']

export function useFaqsPublico() {
  return useQuery({
    queryKey: [...FAQ_KEY, 'publico'],
    queryFn: () => faqService.listarPublico(),
    staleTime: 5 * 60_000,
  })
}

export function useFaqsAdmin() {
  return useQuery({
    queryKey: [...FAQ_KEY, 'admin'],
    queryFn: () => faqService.listarAdmin(),
    staleTime: 30_000,
  })
}

export function useCrearFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearFaqPayload) => faqService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEY })
      toast.success('FAQ creada.')
    },
    onError: () => toast.error('No se pudo crear la FAQ.'),
  })
}

export function useActualizarFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarFaqPayload
    }) => faqService.actualizar(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEY })
      toast.success('FAQ actualizada.')
    },
    onError: () => toast.error('No se pudo actualizar la FAQ.'),
  })
}

export function useToggleFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      visible ? faqService.desactivar(id) : faqService.activar(id),
    onSuccess: (_, { visible }) => {
      qc.invalidateQueries({ queryKey: FAQ_KEY })
      toast.success(visible ? 'FAQ desactivada.' : 'FAQ activada.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useReordenarFaqs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => faqService.reordenar(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
    onError: () => toast.error('No se pudo reordenar.'),
  })
}

export function useEliminarFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => faqService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEY })
      toast.success('FAQ eliminada.')
    },
    onError: () => toast.error('No se pudo eliminar la FAQ.'),
  })
}
