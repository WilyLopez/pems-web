'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

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
  operacion:          'Horarios de operación',
  'reservas-eventos': 'Reservas y eventos',
  sede:               'Datos de la sede',
  seguridad:          'Seguridad de acceso',
  sistema:            'Sistema e integraciones',
}

export function useConfiguracionNav() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const params       = useParams<{ seccion?: string }>()

  const seccion = (params.seccion ?? null) as SeccionConfig | null
  const modal   = (searchParams.get('m') ?? null) as 'view' | 'edit' | null

  const abrirSeccion = useCallback(
    (s: SeccionConfig, m: 'view' | 'edit' = 'view') => {
      const query = m === 'edit' ? '?m=edit' : ''
      router.push(`/admin/configuracion/${s}${query}`, { scroll: false })
    },
    [router],
  )

  const cerrar = useCallback(
    () => router.push('/admin/configuracion', { scroll: false }),
    [router],
  )

  const navPropsFor = useCallback(
    (key: SeccionConfig): SeccionNavProps => ({
      forceModal:   seccion === key ? (modal ?? 'view') : null,
      onOpenChange: (m) => (m ? abrirSeccion(key, m) : cerrar()),
    }),
    [seccion, modal, abrirSeccion, cerrar],
  )

  return { seccion, modal, abrirSeccion, cerrar, navPropsFor }
}
