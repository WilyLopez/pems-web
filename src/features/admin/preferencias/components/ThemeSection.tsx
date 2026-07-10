'use client'

import React from 'react'
import { PreferenciaAdmin, TemaAdmin } from '@/types/preferencias.types'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionGroup } from './shared/SectionUI'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const TEMAS: {
  value: TemaAdmin
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  preview: string
}[] = [
  {
    value: 'LIGHT',
    label: 'Claro',
    desc: 'Fondo blanco',
    icon: Sun,
    preview: 'bg-gradient-to-br from-white to-gray-100 border border-gray-200',
  },
  {
    value: 'DARK',
    label: 'Oscuro',
    desc: 'Fondo oscuro',
    icon: Moon,
    preview: 'bg-gradient-to-br from-gray-800 to-gray-950',
  },
  {
    value: 'SYSTEM',
    label: 'Sistema',
    desc: 'Sigue el SO',
    icon: Monitor,
    preview: 'bg-gradient-to-br from-gray-100 to-gray-800',
  },
]

export function ThemeSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup
        title="Tema de la interfaz"
        icon={<Sun className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEMAS.map(({ value, label, desc, icon: Icon, preview }) => {
            const isSelected = prefs.tema === value
            return (
              <button
                key={value}
                onClick={() => onChange({ tema: value })}
                className={cn(
                  'flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg',
                    preview
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      value === 'DARK' ? 'text-white' : 'text-gray-600'
                    )}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      'text-xs font-semibold leading-none',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {desc}
                  </p>
                </div>
                <div
                  className={cn(
                    'h-1 w-8 rounded-full transition-all duration-200',
                    isSelected ? 'bg-primary' : 'bg-transparent'
                  )}
                />
              </button>
            )
          })}
        </div>
      </SectionGroup>
    </div>
  )
}
