import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { clientesApi } from '@/features/admin/clientes/services/clientes.api'
import { Cliente } from '@/features/admin/clientes/types'

interface UseBuscadorClienteParams {
  clienteSearch: string
  clienteSel: Cliente | null
}

export function useBuscadorCliente({
  clienteSearch,
  clienteSel,
}: UseBuscadorClienteParams) {
  const debouncedSearch = useDebounce(clienteSearch, 350)

  const { data: clientesPage, isFetching: buscandoClientes } = useQuery({
    queryKey: ['clientes-search', debouncedSearch],
    queryFn: () => clientesApi.listar({ search: debouncedSearch, size: 8 }),
    enabled: debouncedSearch.length >= 2 && !clienteSel,
    staleTime: 10_000,
  })

  return {
    clientes: clientesPage?.content ?? [],
    buscandoClientes,
  }
}
