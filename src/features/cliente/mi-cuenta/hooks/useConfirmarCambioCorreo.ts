import { useMutation } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente.service'
import { ApiError } from '@/types/api.types'

export function useConfirmarCambioCorreo() {
  return useMutation<void, ApiError, string>({
    mutationFn: async (token: string) => {
      await clienteService.confirmarCambioCorreo(token)
    },
  })
}
