'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { EstadoReserva } from '../types'

export function useReservasNav() {
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
  const estado = (searchParams.get('estado') || '') as EstadoReserva | ''
  const fecha = searchParams.get('fecha') || ''
  
  const ingresado = useMemo(() => {
    const ing = searchParams.get('ingresado')
    if (ing === 'true') return true
    if (ing === 'false') return false
    return undefined
  }, [searchParams])

  const modal = searchParams.get('modal') 
  const actionId = searchParams.get('actionId') 
  const drawerId = searchParams.get('drawerId') 

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

  const setPage = useCallback((p: number) => updateParams({ page: p > 0 ? p.toString() : null }), [updateParams])
  
  const setSize = useCallback((s: number) => {
    updateParams({ size: s.toString(), page: null })
  }, [updateParams])

  const setSearch = useCallback((s: string) => {
    updateParams({ search: s || null, page: null })
  }, [updateParams])

  const setEstado = useCallback((e: string) => {
    updateParams({ estado: e || null, page: null })
  }, [updateParams])

  const setFecha = useCallback((f: string) => {
    updateParams({ fecha: f || null, page: null })
  }, [updateParams])

  const setIngresado = useCallback((ing?: boolean) => {
    updateParams({ ingresado: ing !== undefined ? String(ing) : null, page: null })
  }, [updateParams])

  const openAction = useCallback((m: string, id: number) => {
    updateParams({ modal: m, actionId: id.toString() })
  }, [updateParams])

  const openDrawer = useCallback((id: number) => {
    updateParams({ drawerId: id.toString() })
  }, [updateParams])

  const openFidelizacion = useCallback(() => {
    updateParams({ modal: 'fidelizacion' })
  }, [updateParams])

  const openEstados = useCallback(() => {
    updateParams({ modal: 'estados' })
  }, [updateParams])

  const closeAll = useCallback(() => {
    updateParams({ modal: null, actionId: null, drawerId: null })
  }, [updateParams])

  return {
    page,
    size,
    search,
    estado,
    fecha,
    ingresado,
    modal,
    actionId: actionId ? parseInt(actionId, 10) : null,
    drawerId: drawerId ? parseInt(drawerId, 10) : null,
    setPage,
    setSize,
    setSearch,
    setEstado,
    setFecha,
    setIngresado,
    openAction,
    openDrawer,
    openFidelizacion,
    openEstados,
    closeAll,
  }
}
