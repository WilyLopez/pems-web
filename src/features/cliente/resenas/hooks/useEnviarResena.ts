'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resenaService } from '@/services/resena.service'
import { Resena, SubmitResenaPayload } from '@/types/resena.types'
import { ApiError } from '@/types/api.types'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'

export function useEnviarResena() {
  const qc = useQueryClient()
  return useMutation<Resena, ApiError, SubmitResenaPayload>({
    mutationFn: (payload) => resenaService.submit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PUBLIC_QUERY_KEYS.testimonios })
      qc.invalidateQueries({ queryKey: ['resenas'] })
      toast.success('Gracias. Tu opinión está en revisión.')
    },
    onError: (error) =>
      toast.error(error?.message ?? 'No se pudo enviar tu opinión.'),
  })
}
