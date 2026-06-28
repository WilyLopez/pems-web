'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { type SectionId, DEFAULT_SECTION } from '../types'

export function useConfiguracionPublicaNav() {
  const router = useRouter()
  const params = useParams<{ seccion?: string }>()

  const seccion = ((params.seccion as SectionId | undefined) ??
    DEFAULT_SECTION) as SectionId

  const navegar = useCallback(
    (s: SectionId) =>
      router.push(`/admin/cms/configuracion-publica/${s}`, { scroll: false }),
    [router]
  )

  return { seccion, navegar }
}
