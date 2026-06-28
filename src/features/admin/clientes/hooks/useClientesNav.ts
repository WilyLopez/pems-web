'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { FiltroCliente } from '../types'

export function useClientesNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = useMemo(() => {
    const p = searchParams.get('page')
    return p ? parseInt(p, 10) : 0
  }, [searchParams])

  const search = searchParams.get('search') || ''
  const filtro = (searchParams.get('filtro') || 'todos') as FiltroCliente

  const drawerId = useMemo(() => {
    const id = searchParams.get('drawerId')
    return id ? parseInt(id, 10) : null
  }, [searchParams])

  const modal = searchParams.get('modal')

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
    page,
    search,
    filtro,
    drawerId,
    modal,
    setPage: (p: number) => updateParams({ page: p > 0 ? p.toString() : null }),
    setSearch: (s: string) => updateParams({ search: s || null, page: null }),
    setFiltro: (f: FiltroCliente) =>
      updateParams({ filtro: f !== 'todos' ? f : null, page: null }),
    openDrawer: (id: number) => updateParams({ drawerId: id.toString() }),
    closeDrawer: () => updateParams({ drawerId: null }),
    openNuevoModal: () => updateParams({ modal: 'nuevo' }),
    closeNuevoModal: () => updateParams({ modal: null }),
  }
}
