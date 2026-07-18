'use client'

import Link from 'next/link'
import { PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LoginGuard() {
  return (
    <div className="flex flex-col items-center text-center py-20 space-y-5 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-rosa/10 flex items-center justify-center">
        <PartyPopper className="h-8 w-8 text-brand-rosa" />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900">
          Inicia sesión para continuar
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Necesitas una cuenta para solicitar tu evento privado.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button
          asChild
          className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full"
        >
          <Link href="/auth/login?callbackUrl=/cliente/celebraciones/solicitar">
            Iniciar sesión
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/auth/registro?callbackUrl=/cliente/celebraciones/solicitar">
            Crear cuenta
          </Link>
        </Button>
      </div>
    </div>
  )
}
