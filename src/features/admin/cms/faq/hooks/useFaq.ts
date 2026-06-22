'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { faqService } from '@/services/faq.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import { Faq, CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'

export function useFaqsPublico() {
  return useQuery({
    queryKey: ['faqs', 'publico'],
    queryFn: () => faqService.listarPublico(),
    staleTime: 5 * 60_000,
  })
}

export function useFaqsAdmin() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.faqAdmin(),
    queryFn: () => faqService.listarAdmin(),
    staleTime: 30_000,
  })
}

export function useCrearFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearFaqPayload) => faqService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      toast.success('Pregunta frecuente creada.')
    },
    onError: () => toast.error('No se pudo crear la pregunta frecuente.'),
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
      qc.invalidateQueries({ queryKey: ['faqs'] })
      toast.success('Pregunta frecuente actualizada.')
    },
    onError: () => toast.error('No se pudo actualizar la pregunta frecuente.'),
  })
}

export function useToggleFaq() {
  const qc = useQueryClient()
  const queryKey = CMS_QUERY_KEYS.faqAdmin()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      visible ? faqService.desactivar(id) : faqService.activar(id),
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey })
      const previousFaqs = qc.getQueryData<Faq[]>(queryKey)
      if (previousFaqs) {
        qc.setQueryData<Faq[]>(
          queryKey,
          previousFaqs.map((faq) =>
            faq.id === id ? { ...faq, visible: !visible } : faq
          )
        )
      }
      return { previousFaqs }
    },
    onError: (err, variables, context) => {
      if (context?.previousFaqs) {
        qc.setQueryData(queryKey, context.previousFaqs)
      }
      toast.error('No se pudo cambiar el estado de visibilidad.')
    },
    onSuccess: (_, { visible }) => {
      toast.success(visible ? 'Pregunta desactivada.' : 'Pregunta activada.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useReordenarFaqs() {
  const qc = useQueryClient()
  const queryKey = CMS_QUERY_KEYS.faqAdmin()
  return useMutation({
    mutationFn: (ids: number[]) => faqService.reordenar(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey })
      const previousFaqs = qc.getQueryData<Faq[]>(queryKey)
      if (previousFaqs) {
        const faqMap = new Map(previousFaqs.map((f) => [f.id, f]))
        const newFaqsOrder = ids
          .map((id) => faqMap.get(id))
          .filter((f): f is Faq => !!f)
        qc.setQueryData<Faq[]>(queryKey, newFaqsOrder)
      }
      return { previousFaqs }
    },
    onError: (err, variables, context) => {
      if (context?.previousFaqs) {
        qc.setQueryData(queryKey, context.previousFaqs)
      }
      toast.error('No se pudo reordenar las preguntas frecuentes.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}

export function useEliminarFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => faqService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      toast.success('Pregunta frecuente eliminada.')
    },
    onError: () => toast.error('No se pudo eliminar la pregunta frecuente.'),
  })
}
