'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { COOKIE_TIPO_PERFIL, COOKIE_MAX_AGE } from '@/lib/auth-utils'
import { useRouter } from 'next/navigation'
import { financeApi } from '@/features/admin/finanzas/services/finance.api'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    user,
    token,
    roles,
    permisos,
    tipoPerfil,
    nombre,
    correo,
    fotoPerfilUrl,
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
          fotoPerfilUrl,
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
          fotoPerfilUrl,
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
    if (roles.includes('CAJERO') || roles.includes('ADMIN') || roles.includes('SUPERADMIN')) {
      try {
        const sesionCaja = await financeApi.obtenerMiSesion()
        if (sesionCaja) {
          const confirmar = window.confirm(
            'Tienes una caja abierta. Si cierras sesión, la caja seguirá abierta y otro usuario no podrá cobrar hasta que sea cerrada. ¿Deseas continuar de todas formas?'
          )
          if (!confirmar) return
        }
      } catch {
        // no se pudo verificar el estado de la caja — no bloquear el logout
      }
    }

    await supabase.auth.signOut()
    clearAuth()
    queryClient.clear()
    document.cookie = `${COOKIE_TIPO_PERFIL}=; path=/; max-age=0`
    router.push('/auth/login')
  }, [roles, queryClient])

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
    fotoPerfilUrl,
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
