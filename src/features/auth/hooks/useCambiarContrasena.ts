import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { CambiarFormValues } from '../schemas/auth.schema'

interface Options {
  onSuccess?: () => void
  onError?: (err: any) => void
}

export function useCambiarContrasena(options?: Options) {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: CambiarFormValues) => {
      await authService.cambiarPasswordMe({
        passwordActual: values.contrasenaActual,
        nuevoPassword: values.nuevaContrasena,
      })

      const { error } = await supabase.auth.updateUser({
        password: values.nuevaContrasena,
      })
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente.')
      options?.onSuccess?.()
    },
    onError: (err: any) => {
      options?.onError?.(err)
    },
  })
}
