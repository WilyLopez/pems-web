import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { RegistroFormValues } from '../schemas/auth.schema'

export function useRegistro() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (values: RegistroFormValues) => {
      await authService.registrarCliente({
        nombre: values.nombre,
        correo: values.correo,
        password: values.contrasena,
        telefono: values.telefono,
        tipoDocumento: 'DNI',
        numeroDocumento: values.dni || '',
      })
    },
    onSuccess: () => {
      toast.success('Cuenta creada. Revisa tu correo para verificarla.')
      router.push('/auth/login')
    },
    onError: (err: any) => {
      const hasFieldErrors =
        (err.erroresCampo && err.erroresCampo.length > 0) ||
        (err.errorsCampo && err.errorsCampo.length > 0)

      if (!hasFieldErrors) {
        const msg = err.message ?? 'No se pudo crear la cuenta.'
        toast.error(msg)
      }
    },
  })
}
