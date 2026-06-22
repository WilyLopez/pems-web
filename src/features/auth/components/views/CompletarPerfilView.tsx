'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserCheck, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export function CompletarPerfilView() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo-secundario.png"
            alt="Kiki y Lala"
            width={120}
            height={50}
            className="mx-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className="w-16 h-16 bg-brand-azul/10 rounded-full flex items-center justify-center mx-auto">
          <UserCheck className="h-8 w-8 text-brand-azul" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">Bienvenido a Kiki y Lala</h1>
          <p className="text-sm text-gray-500">
            Tu cuenta fue creada exitosamente. Completa tus datos personales para una mejor experiencia y acceder a todos los beneficios.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/cliente/mi-cuenta')}
            className="w-full h-12 rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white font-bold gap-2"
          >
            Completar mis datos
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={() => router.push('/cliente')}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            Hacerlo más tarde
          </button>
        </div>
      </div>
    </div>
  )
}
