import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clientesApi } from '../services/clientes.api'
import { buildParams } from '../utils/clientes.utils'
import { useClientesNav } from './useClientesNav'
import { ClienteFormValues } from '../schema/cliente.schema'

export const CLIENTES_KEYS = {
  LIST: 'clientes-admin-list',
  DETAIL: 'cliente-admin-detail',
} as const

export function useClientesList() {
  const { page, search, filtro } = useClientesNav()
  return useQuery({
    queryKey: [CLIENTES_KEYS.LIST, page, search, filtro],
    queryFn: () => clientesApi.listar(buildParams(filtro, page, 15, search)),
    placeholderData: (previousData) => previousData,
  })
}

export function useClienteDetail(id: number | null) {
  return useQuery({
    queryKey: [CLIENTES_KEYS.DETAIL, id],
    queryFn: () => clientesApi.obtener(id!),
    enabled: !!id,
  })
}

export function useMutacionesCliente(clienteId?: number | null) {
  const qc = useQueryClient()

  const invalidarTodo = () => {
    qc.invalidateQueries({ queryKey: [CLIENTES_KEYS.LIST] })
    if (clienteId) {
      qc.invalidateQueries({ queryKey: [CLIENTES_KEYS.DETAIL, clienteId] })
    }
  }

  const toggleVip = useMutation({
    mutationFn: ({ id, esVip }: { id: number; esVip: boolean }) =>
      esVip ? clientesApi.quitarVip(id) : clientesApi.hacerVip(id, 10),
    onSuccess: (_, variables) => {
      invalidarTodo()
      toast.success(variables.esVip ? 'Estado VIP removido.' : 'Cliente promovido a VIP.')
    },
    onError: () => toast.error('No se pudo actualizar el estado VIP.'),
  })

  const registrarVisita = useMutation({
    mutationFn: (id: number) => clientesApi.registrarVisita(id),
    onSuccess: () => {
      invalidarTodo()
      toast.success('Visita registrada.')
    },
    onError: () => toast.error('No se pudo registrar la visita.'),
  })

  const crearCliente = useMutation({
    mutationFn: (values: ClienteFormValues) =>
      clientesApi.registrarAdmin({ ...values, origen: 'ADMIN' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTES_KEYS.LIST] })
      toast.success('Cliente registrado correctamente.')
    },
    onError: () => toast.error('No se pudo registrar el cliente.'),
  })

  return { toggleVip, registrarVisita, crearCliente }
}
