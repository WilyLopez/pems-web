import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useMisReservasNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab =
    (searchParams.get('tab') as 'proximas' | 'historial') || 'proximas'
  const detalleId = searchParams.get('detalle')
    ? parseInt(searchParams.get('detalle')!, 10)
    : null

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

  const setTab = useCallback(
    (t: 'proximas' | 'historial') => {
      updateParams({ tab: t })
    },
    [updateParams]
  )

  const setDetalleId = useCallback(
    (id: number | null) => {
      updateParams({ detalle: id ? id.toString() : null })
    },
    [updateParams]
  )

  return {
    tab,
    setTab,
    detalleId,
    setDetalleId,
  }
}
