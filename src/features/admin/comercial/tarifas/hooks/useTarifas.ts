import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  tarifaService,
  ConfigurarTarifaPayload,
} from '@/services/tarifa.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'

export function useTarifasActivas(idSede: number | null) {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.tarifasActivas(idSede),
    queryFn: () => tarifaService.listarActivas(idSede!),
    enabled: !!idSede,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePreciosPublicos(idSede: number) {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.preciosPublicos(idSede),
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
      queryClient.invalidateQueries({ queryKey: ['tarifas-activas', idSede] })
      queryClient.invalidateQueries({ queryKey: ['precios-publicos'] })
      toast.success('Tarifa actualizada correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      toast.error(msg ?? 'Error al actualizar la tarifa')
    },
  })
}
