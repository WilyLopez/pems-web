'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export type PerfilTab = 'perfil' | 'seguridad'

export function usePerfilNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = (searchParams.get('tab') as PerfilTab) || 'perfil'

  const userId = useMemo(() => {
    const id = searchParams.get('userId')
    return id ? parseInt(id, 10) : null
  }, [searchParams])

  const setTab = useCallback((t: PerfilTab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (t === 'perfil') {
      params.delete('tab')
    } else {
      params.set('tab', t)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const setUserId = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id === null) {
      params.delete('userId')
    } else {
      params.set('userId', id.toString())
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  return {
    tab,
    userId,
    setTab,
    setUserId,
  }
}
