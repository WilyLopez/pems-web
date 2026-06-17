'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  paso: number
  total: number
  onSalir: () => void
}

export function WizardHeader({ paso, total, onSalir }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-secundario.png"
            alt="Kiki y Lala"
            width={90}
            height={36}
            className="h-8 w-auto"
            style={{ height: 'auto' }}
          />
          <div className="hidden sm:block h-5 w-px bg-gray-200" />
          <span className="hidden sm:block text-sm font-semibold text-gray-600">
            Solicitar evento
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i < paso
                    ? 'bg-brand-rosa w-6'
                    : i === paso - 1
                    ? 'bg-brand-rosa w-8'
                    : 'bg-gray-200 w-4'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {paso} / {total}
          </span>
        </div>

        <button
          onClick={onSalir}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Salir del wizard"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
