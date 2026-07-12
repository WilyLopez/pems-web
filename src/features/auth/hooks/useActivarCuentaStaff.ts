import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/types/api.types'

interface ActivarCuentaVariables {
  token: string
  nuevaContrasena: string
}

export function useActivarCuentaStaff() {
  const router = useRouter()

  return useMutation<void, ApiError, ActivarCuentaVariables>({
    mutationFn: async (variables: ActivarCuentaVariables) => {
      await authService.activarCuentaStaff(
        variables.token,
        variables.nuevaContrasena
      )
    },
    onSuccess: () => {
      router.push('/auth/login?mensaje=cuenta_activada')
    },
  })
}
