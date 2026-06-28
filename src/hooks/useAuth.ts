'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { COOKIE_TIPO_PERFIL, COOKIE_MAX_AGE } from '@/lib/auth-utils'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const {
    user,
    token,
    roles,
    permisos,
    tipoPerfil,
    nombre,
    correo,
    idSede,
    idUsuario,
    clientePerfilId,
    isLoading,
    setAuth,
    clearAuth,
  } = useAuthStore()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setAuth({ user: session.user, token: session.access_token })
        await loadPermisos(session.access_token)
      } else {
        clearAuth()
      }
    })

    loadInitialSession()

    return () => subscription.unsubscribe()
  }, [])

  async function loadInitialSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      setAuth({ user: session.user, token: session.access_token })
      await loadPermisos(session.access_token)
    } else {
      clearAuth()
    }
  }

  async function loadPermisos(accessToken: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        const {
          tipoPerfil,
          roles,
          permisos,
          nombre,
          correo,
          sedeId,
          clientePerfilId,
          staffId,
        } = data.data

        useAuthStore.getState().setPermisos({
          roles,
          permisos,
          tipoPerfil,
          nombre,
          correo,
          idSede: sedeId ?? null,
          idUsuario: staffId ?? null,
          clientePerfilId: clientePerfilId ?? null,
        })

        if (typeof document !== 'undefined') {
          document.cookie = `${COOKIE_TIPO_PERFIL}=${tipoPerfil}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
        }
      }
    } catch {
      // backend no disponible — la sesión Supabase sigue activa
    }
  }

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    clearAuth()
    document.cookie = `${COOKIE_TIPO_PERFIL}=; path=/; max-age=0`
    router.push('/auth/login')
  }, [])

  const tienePermiso = useCallback(
    (permiso: string) => permisos.includes(permiso),
    [permisos]
  )

  return {
    user,
    token,
    roles,
    permisos,
    tipoPerfil,
    nombre,
    correo,
    idSede,
    idUsuario,
    clientePerfilId,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: roles.some((r) => ['SUPERADMIN', 'ADMIN'].includes(r)),
    isCliente: tipoPerfil === 'CLIENTE',
    isCajero: roles.includes('CAJERO'),
    isSuperAdmin: roles.includes('SUPERADMIN'),
    isStaff: tipoPerfil === 'STAFF',
    tienePermiso,
    logout,
  }
}
