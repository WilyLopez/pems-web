'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Role } from '@/types/auth.types'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }, [router])

  return {
    user: session?.user ?? null,
    token: session?.user?.token ?? null,
    rol: (session?.user?.rol ?? null) as Role | null,
    idSede: session?.user?.idSede ?? null,
    isAdmin: session?.user?.rol === 'ADMIN',
    isCliente: session?.user?.rol === 'CLIENTE',
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
  }
}
