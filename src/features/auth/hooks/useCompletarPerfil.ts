import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { CompletarPerfilFormValues } from '../schemas/auth.schema'
import { ApiError } from '@/types/api.types'

export function useCompletarPerfil() {
  return useMutation({
    mutationFn: (values: CompletarPerfilFormValues) =>
      authService.completarPerfil({
        nombres: values.nombres,
        tipoDocumento: 'DNI',
        numeroDocumento: values.dni || undefined,
        telefono: values.telefono || undefined,
        aceptaComunicaciones: values.aceptaTerminos,
      }),
    onSuccess: () => {
      window.location.assign('/cliente')
    },
    onError: (err: ApiError) => {
      const fieldErrors = err.erroresCampo || err.errorsCampo
      if (!fieldErrors || fieldErrors.length === 0) {
        toast.error(err.message ?? 'No se pudo completar tu perfil.')
      }
    },
  })
}
