'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { format, parseISO, isValid } from 'date-fns'

export type CalendarView = 'mes' | 'semana' | 'dia'

export function useCalendarNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const vista = useMemo(() => {
    const v = searchParams.get('vista')
    return (v === 'mes' || v === 'semana' || v === 'dia' ? v : 'mes') as CalendarView
  }, [searchParams])

  const fechaStr = searchParams.get('fecha')
  const fecha = useMemo(() => {
    if (!fechaStr) return new Date()
    const parsed = parseISO(fechaStr)
    return isValid(parsed) ? parsed : new Date()
  }, [fechaStr])

  const selectedStr = searchParams.get('selected')
  const selectedDate = useMemo(() => {
    if (!selectedStr) return null
    const parsed = parseISO(selectedStr)
    return isValid(parsed) ? parsed : null
  }, [selectedStr])

  const modal = searchParams.get('modal') // 'bloqueo' | 'feriado' | 'config' | 'programacion'
  const drawer = searchParams.get('drawer') // 'detalle' | 'evento' | 'reserva'

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

  const setVista = useCallback((v: CalendarView) => updateParams({ vista: v }), [updateParams])
  
  const setFecha = useCallback((d: Date) => {
    updateParams({ fecha: format(d, 'yyyy-MM-dd') })
  }, [updateParams])

  const selectDate = useCallback((d: Date | null) => {
    updateParams({ selected: d ? format(d, 'yyyy-MM-dd') : null })
  }, [updateParams])

  const openModal = useCallback((m: string | null) => updateParams({ modal: m }), [updateParams])
  const openDrawer = useCallback((d: string | null) => updateParams({ drawer: d }), [updateParams])

  const closeAll = useCallback(() => {
    updateParams({ modal: null, drawer: null, selected: null })
  }, [updateParams])

  return {
    vista,
    fecha,
    selectedDate,
    modal,
    drawer,
    setVista,
    setFecha,
    selectDate,
    openModal,
    openDrawer,
    closeAll,
  }
}
