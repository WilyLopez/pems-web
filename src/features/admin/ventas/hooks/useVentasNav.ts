'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function useVentasNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = useMemo(() => {
    const p = searchParams.get('page')
    return p ? parseInt(p, 10) : 0
  }, [searchParams])

  const size = useMemo(() => {
    const s = searchParams.get('size')
    return s ? parseInt(s, 10) : 10
  }, [searchParams])

  const search = searchParams.get('search') || ''
  const tipo = searchParams.get('tipo') || ''

  const desde = useMemo(() => {
    return (
      searchParams.get('desde') ||
      format(startOfMonth(new Date()), 'yyyy-MM-dd')
    )
  }, [searchParams])

  const hasta = useMemo(() => {
    return (
      searchParams.get('hasta') || format(endOfMonth(new Date()), 'yyyy-MM-dd')
    )
  }, [searchParams])

  const tab = searchParams.get('tab') || 'lista'

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

  const setPage = useCallback(
    (p: number) => updateParams({ page: p > 0 ? p.toString() : null }),
    [updateParams]
  )
  const setSize = useCallback(
    (s: number) => updateParams({ size: s.toString(), page: null }),
    [updateParams]
  )
  const setSearch = useCallback(
    (s: string) => updateParams({ search: s || null, page: null }),
    [updateParams]
  )
  const setDesde = useCallback(
    (d: string) => updateParams({ desde: d || null, page: null }),
    [updateParams]
  )
  const setHasta = useCallback(
    (h: string) => updateParams({ hasta: h || null, page: null }),
    [updateParams]
  )
  const setTipo = useCallback(
    (t: string) => updateParams({ tipo: t || null, page: null }),
    [updateParams]
  )
  const setTab = useCallback(
    (t: string) => updateParams({ tab: t }),
    [updateParams]
  )

  return {
    page,
    size,
    search,
    desde,
    hasta,
    tipo,
    tab,
    setPage,
    setSize,
    setSearch,
    setDesde,
    setHasta,
    setTipo,
    setTab,
  }
}
