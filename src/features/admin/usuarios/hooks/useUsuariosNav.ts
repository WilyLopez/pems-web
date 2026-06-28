'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export type ModalType = 'nuevo' | 'ver' | 'editar' | 'rol' | 'reset' | 'desactivar' | 'desbloquear'

export function useUsuariosNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''
  const rol = searchParams.get('rol') || 'TODOS'
  const estado = searchParams.get('estado') || 'TODOS'
  const modal = searchParams.get('modal') as ModalType | null

  const page = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '1', 10)
    return isNaN(p) || p < 1 ? 1 : p
  }, [searchParams])

  const userId = useMemo(() => {
    const id = searchParams.get('userId')
    return id ? parseInt(id, 10) : null
  }, [searchParams])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      })
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return {
    search,
    rol,
    estado,
    modal,
    page,
    userId,
    setSearch: (s: string) => updateParams({ search: s || null, page: null }),
    setRol: (r: string) => updateParams({ rol: r !== 'TODOS' ? r : null, page: null }),
    setEstado: (e: string) => updateParams({ estado: e !== 'TODOS' ? e : null, page: null }),
    setPage: (p: number) => updateParams({ page: p > 1 ? p.toString() : null }),
    openModal: (m: ModalType, id?: number) =>
      updateParams({ modal: m, userId: id ? id.toString() : null }),
    closeModal: () => updateParams({ modal: null, userId: null }),
  }
}
