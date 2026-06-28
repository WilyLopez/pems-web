'use client'

import { useEffect } from 'react'
import { useNotificacionesStore } from '@/lib/store/notificaciones.store'

export function useNotificaciones(intervaloMs = 30_000) {
  const fetchCount = useNotificacionesStore((s) => s.fetchCount)

  useEffect(() => {
    fetchCount()

    const tick = () => {
      if (document.visibilityState === 'visible') fetchCount()
    }

    const id = setInterval(tick, intervaloMs)
    document.addEventListener('visibilitychange', tick)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [intervaloMs, fetchCount])
}
