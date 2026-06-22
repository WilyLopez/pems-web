'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'
import { ActualizarConfiguracionPayload } from '@/types/configuracion-publica.types'

export const CONFIG_KEY = ['configuracion-publica']

export function useConfiguracionPublica() {
  return useQuery({
    queryKey: [...CONFIG_KEY, 'publica'],
    queryFn: () => configuracionPublicaService.obtenerPublica(),
    staleTime: 5 * 60_000,
  })
}

export function useConfiguracionAdmin() {
  return useQuery({
    queryKey: [...CONFIG_KEY, 'admin'],
    queryFn: () => configuracionPublicaService.obtenerAdmin(),
    staleTime: 30_000,
  })
}
export function useActualizarConfiguracionPublica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActualizarConfiguracionPayload) =>
      configuracionPublicaService.actualizar(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIG_KEY })
      toast.success('Configuración guardada.')
    },
    onError: () => toast.error('No se pudo guardar la configuración.'),
  })
}
