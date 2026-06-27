'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export type SeccionConfig =
  | 'operacion'
  | 'reservas-eventos'
  | 'sede'
  | 'seguridad'
  | 'sistema'

export interface SeccionNavProps {
  forceModal:   'view' | 'edit' | null
  onOpenChange: (m: 'view' | 'edit' | null) => void
}

export const SECCION_LABELS: Record<SeccionConfig, string> = {
  operacion:         'Horarios de operación',
  'reservas-eventos': 'Reservas y eventos',
  sede:              'Datos de la sede',
  seguridad:         'Seguridad de acceso',
  sistema:           'Sistema e integraciones',
}

export function useConfiguracionNav() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const seccion = searchParams.get('s') as SeccionConfig | null
  const modal   = searchParams.get('m') as 'view' | 'edit' | null

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const abrirSeccion = useCallback(
    (s: SeccionConfig, m: 'view' | 'edit' = 'view') => update({ s, m }),
    [update],
  )

  const cerrar = useCallback(() => update({ s: null, m: null }), [update])

  const navPropsFor = useCallback(
    (key: SeccionConfig): SeccionNavProps => ({
      forceModal:   seccion === key ? modal : null,
      onOpenChange: (m) => (m ? abrirSeccion(key, m) : cerrar()),
    }),
    [seccion, modal, abrirSeccion, cerrar],
  )

  return { seccion, modal, abrirSeccion, cerrar, navPropsFor }
}
