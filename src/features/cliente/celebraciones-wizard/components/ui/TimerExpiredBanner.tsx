'use client'

import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  onRestart: () => void
}

export function TimerExpiredBanner({ onRestart }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-20 space-y-5 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
        <Clock className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900">
          Tu sesión ha expirado
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          El tiempo de 10 minutos para completar la solicitud ha concluido.
          Puedes comenzar de nuevo.
        </p>
      </div>
      <Button
        onClick={onRestart}
        className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full px-8"
      >
        Comenzar de nuevo
      </Button>
    </div>
  )
}
