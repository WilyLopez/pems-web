import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { authService } from '@/services/auth.service'
import { getDashboardUrl, COOKIE_TIPO_PERFIL, COOKIE_MAX_AGE } from '@/lib/auth-utils'
import { toast } from 'sonner'
import { LoginFormValues } from '../schemas/auth.schema'

function isValidRedirect(url: string, tipoPerfil: string): boolean {
  if (tipoPerfil === 'STAFF' && url.startsWith('/admin')) return true
  if (tipoPerfil === 'CLIENTE' && url.startsWith('/cliente')) return true
  return false
}

export function useLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const loginData = await authService.login({
        email: values.correo,
        password: values.contrasena,
      })

      await supabase.auth.setSession({
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      })

      if (!res.ok) {
        await supabase.auth.signOut()
        throw new Error('Tu cuenta no tiene acceso al sistema. Contacta al administrador.')
      }

      const meData = await res.json()
      return {
        loginData,
        meData: meData.data,
      }
    },
    onSuccess: ({ loginData, meData }) => {
      const { tipoPerfil, roles, permisos, perfilCompleto, nombre, correo, sedeId, clientePerfilId } = meData

      document.cookie = `${COOKIE_TIPO_PERFIL}=${tipoPerfil}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`

      useAuthStore.getState().setAuth({ user: loginData.user as any, token: loginData.access_token })
      useAuthStore.getState().setPermisos({
        roles,
        permisos,
        tipoPerfil,
        nombre,
        correo,
        idSede: sedeId ?? undefined,
        clientePerfilId,
      })

      if (loginData.debeCambiarPassword) {
        toast.info('Debes cambiar tu contraseña para continuar.')
        router.push('/auth/cambiar-contrasena')
        return
      }

      if (tipoPerfil === 'CLIENTE' && !perfilCompleto) {
        router.push('/auth/completar-perfil')
        return
      }

      const redirectUrl = searchParams.get('redirect')
      if (redirectUrl && isValidRedirect(redirectUrl, tipoPerfil)) {
        router.push(redirectUrl)
      } else {
        router.push(getDashboardUrl(roles, tipoPerfil))
      }
    },
    onError: (err: any) => {
      const msg = err.message || 'Error al iniciar sesión'
      toast.error(msg)
    },
  })
}
