import { useQuery } from '@tanstack/react-query'
import { contratoClienteApi } from '../services/contrato.api'

export function useContratoCliente(idEvento: number | null) {
  return useQuery({
    queryKey: ['contrato-cliente', idEvento],
    queryFn: () => contratoClienteApi.obtenerPorEvento(idEvento!),
    enabled: !!idEvento,
    retry: false,
    staleTime: 30_000,
  })
}
