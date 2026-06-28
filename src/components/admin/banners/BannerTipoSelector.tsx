'use client'

import {
  Sparkles,
  Percent,
  PartyPopper,
  Info,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TipoBanner } from '@/types/banner.types'

interface BannerTipoSelectorProps {
  value: string | undefined
  onChange: (tipo: TipoBanner) => void
}

const TIPOS: {
  value: TipoBanner
  label: string
  icon: LucideIcon
  color: string
}[] = [
  {
    value: 'HERO',
    label: 'Hero',
    icon: Sparkles,
    color: 'border-brand-azul/40 text-brand-azul bg-brand-azul/[0.08]',
  },
  {
    value: 'PROMOCION',
    label: 'Promocion',
    icon: Percent,
    color: 'border-brand-rosa/40 text-brand-rosa bg-brand-rosa/[0.08]',
  },
  {
    value: 'EVENTO',
    label: 'Evento',
    icon: PartyPopper,
    color: 'border-purple-300 text-purple-700 bg-purple-50',
  },
  {
    value: 'INFORMATIVO',
    label: 'Informativo',
    icon: Info,
    color: 'border-gray-300 text-gray-600 bg-gray-50',
  },
  {
    value: 'TEMPORADA',
    label: 'Temporada',
    icon: Leaf,
    color: 'border-green-300 text-green-700 bg-green-50',
  },
]

export function BannerTipoSelector({
  value,
  onChange,
}: BannerTipoSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIPOS.map((tipo) => {
        const Icon = tipo.icon
        return (
          <button
            key={tipo.value}
            type="button"
            onClick={() => onChange(tipo.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
              value === tipo.value
                ? tipo.color + ' ring-1 ring-offset-1 ring-current'
                : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300 hover:text-gray-600'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tipo.label}
          </button>
        )
      })}
    </div>
  )
}
