import { useQuery } from '@tanstack/react-query'
import { configApi } from '../services/config.api'

export function useMediosPago() {
  return useQuery({
    queryKey: ['config', 'medios-pago'],
    queryFn: configApi.getMediosPago,
    staleTime: Infinity,
  })
}
