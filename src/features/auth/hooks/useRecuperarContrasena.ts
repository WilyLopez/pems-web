import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { RecuperarFormValues } from '../schemas/auth.schema'

interface Options {
  onSuccess?: (email: string) => void
}

export function useRecuperarContrasena(options?: Options) {
  return useMutation({
    mutationFn: async (values: RecuperarFormValues) => {
      await authService.recuperarPassword(values.email)
      return values.email
    },
    onSuccess: (email) => {
      options?.onSuccess?.(email)
    },
    onError: () => {
      toast.error('No se pudo enviar el correo. Verifica la dirección.')
    },
  })
}
