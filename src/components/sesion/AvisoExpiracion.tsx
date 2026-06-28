'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'
import { useSesionStore } from '@/lib/store/sesion.store'

export function AvisoExpiracion() {
  const { avisoExpiracion, segundosRestantes, setAvisoExpiracion } =
    useSesionStore()
  const [cuenta, setCuenta] = useState(segundosRestantes)

  useEffect(() => {
    if (!avisoExpiracion) return
    setCuenta(segundosRestantes)
    const intervalo = setInterval(() => {
      setCuenta((c) => {
        if (c <= 1) {
          clearInterval(intervalo)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [avisoExpiracion, segundosRestantes])

  if (!avisoExpiracion) return null

  const min = Math.floor(cuenta / 60)
  const seg = cuenta % 60

  async function seguir() {
    await createClient().auth.refreshSession()
    setAvisoExpiracion(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90] max-w-xs w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 sm:p-5 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">
            Tu sesión expirará pronto
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Por inactividad, se cerrará en{' '}
            <span className="font-mono font-bold text-amber-700">
              {min}:{seg.toString().padStart(2, '0')}
            </span>
          </p>
          <button
            onClick={seguir}
            className="mt-3 w-full py-2 bg-brand-azul text-white rounded-xl text-xs font-bold hover:bg-brand-azul/90 transition-colors"
          >
            Seguir trabajando
          </button>
        </div>
      </div>
    </div>
  )
}
