import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NuevaFormValues } from '../schemas/auth.schema'

export function useNuevaContrasena() {
  const router = useRouter()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: NuevaFormValues) => {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })
      if (error) {
        throw new Error(
          error.message ||
            'No se pudo actualizar la contraseña. El enlace puede haber expirado.'
        )
      }
    },
    onSuccess: () => {
      router.push('/auth/login?mensaje=contrasena_actualizada')
    },
  })
}
