import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tarifaService, ConfigurarTarifaPayload } from '@/services/tarifa.service'

export const TARIFAS_ACTIVAS_KEY = 'tarifas-activas'
export const PRECIOS_PUBLICOS_KEY = 'precios-publicos'

export function useTarifasActivas(idSede: number | null) {
  return useQuery({
    queryKey: [TARIFAS_ACTIVAS_KEY, idSede],
    queryFn: () => tarifaService.listarActivas(idSede!),
    enabled: !!idSede,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePreciosPublicos(idSede: number) {
  return useQuery({
    queryKey: [PRECIOS_PUBLICOS_KEY, idSede],
    queryFn: () => tarifaService.preciosPublicos(idSede),
    staleTime: 10 * 60 * 1000,
  })
}

export function useConfigurarTarifa(idSede: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ConfigurarTarifaPayload) =>
      tarifaService.configurar(idSede!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TARIFAS_ACTIVAS_KEY, idSede] })
      queryClient.invalidateQueries({ queryKey: [PRECIOS_PUBLICOS_KEY] })
      toast.success('Tarifa actualizada correctamente')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar la tarifa')
    },
  })
}
