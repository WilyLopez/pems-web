'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSesionStore } from '@/lib/store/sesion.store'

const AVISO_MS = 90_000

export function useIdleWarning() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { setAvisoExpiracion } = useSesionStore()
  const timerAviso = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const idleMs = isAdmin ? 7_200_000 : 2_700_000

  useEffect(() => {
    if (!isAuthenticated) return

    function reiniciar() {
      clearTimeout(timerAviso.current)
      setAvisoExpiracion(false)

      timerAviso.current = setTimeout(() => {
        setAvisoExpiracion(true, Math.floor(AVISO_MS / 1000))
      }, idleMs - AVISO_MS)
    }

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const
    eventos.forEach((e) => window.addEventListener(e, reiniciar))
    reiniciar()

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, reiniciar))
      clearTimeout(timerAviso.current)
    }
  }, [isAuthenticated, idleMs])
}
