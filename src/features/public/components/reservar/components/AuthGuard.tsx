import { Lock } from 'lucide-react'
import Link from 'next/link'

interface AuthGuardProps {
  fecha: string | null
}

export function AuthGuard({ fecha }: AuthGuardProps) {
  const callbackUrl = fecha
    ? `/cliente/reservar?fecha=${fecha}`
    : '/cliente/reservar'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-brand-azul/10 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-brand-azul" />
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Inicia sesión para reservar
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Necesitas una cuenta para comprar tu entrada a la zona de juegos.
        </p>
        <Link
          href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 bg-brand-azul text-white rounded-2xl font-bold text-sm text-center hover:bg-brand-azul/90 transition-colors shadow-sm shadow-blue-100"
        >
          Iniciar sesión
        </Link>
        <Link
          href={`/auth/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  )
}
