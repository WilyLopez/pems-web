'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useUsuariosNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''
  const rol = searchParams.get('rol') || 'TODOS'
  const estado = searchParams.get('estado') || 'TODOS'
  const modal = searchParams.get('modal')

  const userId = useMemo(() => {
    const id = searchParams.get('userId')
    return id ? parseInt(id, 10) : null
  }, [searchParams])

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([name, value]) => {
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  return {
    search,
    rol,
    estado,
    modal,
    userId,
    setSearch: (s: string) => updateParams({ search: s || null }),
    setRol: (r: string) => updateParams({ rol: r !== 'TODOS' ? r : null }),
    setEstado: (e: string) => updateParams({ estado: e !== 'TODOS' ? e : null }),
    openModal: (m: 'nuevo' | 'editar' | 'rol' | 'reset' | 'ver', id?: number) =>
      updateParams({ modal: m, userId: id ? id.toString() : null }),
    closeModal: () => updateParams({ modal: null, userId: null }),
  }
}
