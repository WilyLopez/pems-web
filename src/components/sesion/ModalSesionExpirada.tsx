'use client'

import { createClient } from '@/lib/supabase/client'
import { Lock } from 'lucide-react'
import { useSesionStore } from '@/lib/store/sesion.store'
import { usePathname } from 'next/navigation'

export function ModalSesionExpirada() {
  const { modalExpirada } = useSesionStore()
  const pathname = usePathname()

  if (!modalExpirada || pathname.startsWith('/auth')) return null

  async function volverALogin() {
    await createClient().auth.signOut()
    window.location.href = '/auth/login?expirada=1'
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Tu sesión ha finalizado</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Por tu seguridad, cerramos la sesión tras un período de inactividad.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-green-800">
            Guardamos tu progreso. Podrás continuar donde lo dejaste al volver a entrar.
          </p>
        </div>
        <button
          onClick={volverALogin}
          className="w-full py-3 bg-brand-azul text-white rounded-xl font-bold text-sm hover:bg-brand-azul/90 transition-colors"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  )
}
