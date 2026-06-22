import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fidelizacionApi } from '../services/fidelizacion.api'

export const FIDELIZACION_KEYS = {
  CONFIG: 'fidelizacion-config',
} as const

export function useFidelizacionConfig(idSede?: number) {
  return useQuery({
    queryKey: [FIDELIZACION_KEYS.CONFIG, idSede],
    queryFn: () => fidelizacionApi.obtenerConfig(idSede!),
    enabled: !!idSede,
  })
}

export function useActualizarFidelizacionConfig(idSede?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (umbral: number) =>
      fidelizacionApi.actualizarConfig(idSede!, umbral),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FIDELIZACION_KEYS.CONFIG, idSede] })
      toast.success('Configuración de fidelización actualizada.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo actualizar la configuración.')
    },
  })
}
