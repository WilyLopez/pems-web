'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSesionStore } from '@/lib/store/sesion.store'

const AVISO_MS = 90_000

export function useIdleWarning() {
  const { data: session } = useSession()
  const { setAvisoExpiracion } = useSesionStore()
  const timerAviso = useRef<ReturnType<typeof setTimeout>>()

  const idleMs = session?.user?.rol === 'ADMIN' ? 7_200_000 : 2_700_000

  useEffect(() => {
    if (!session) return

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
  }, [session, idleMs])
}
