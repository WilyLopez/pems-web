'use client'

import { PreferenciaAdmin, TamanioFuente } from '@/types/preferencias.types'
import { Type } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const FUENTES: {
  value: string
  label: string
  family: string
  specimen: string
}[] = [
  {
    value: 'INTER',
    label: 'Inter',
    family: 'Inter, sans-serif',
    specimen: 'Aa Bb Cc',
  },
  {
    value: 'POPPINS',
    label: 'Poppins',
    family: 'Poppins, sans-serif',
    specimen: 'Aa Bb Cc',
  },
  {
    value: 'ROBOTO',
    label: 'Roboto',
    family: 'Roboto, sans-serif',
    specimen: 'Aa Bb Cc',
  },
  {
    value: 'GEIST',
    label: 'Geist',
    family: 'var(--font-geist-sans), sans-serif',
    specimen: 'Aa Bb Cc',
  },
  {
    value: 'SYSTEM',
    label: 'Sistema',
    family: 'system-ui, sans-serif',
    specimen: 'Aa Bb Cc',
  },
]

const TAMANIOS: {
  value: TamanioFuente
  label: string
  desc: string
  specimen: string
  size: string
}[] = [
  {
    value: 'SMALL',
    label: 'Pequeño',
    desc: '13px base',
    specimen: 'Aa',
    size: 'text-xl',
  },
  {
    value: 'NORMAL',
    label: 'Normal',
    desc: '15px base',
    specimen: 'Aa',
    size: 'text-2xl',
  },
  {
    value: 'LARGE',
    label: 'Grande',
    desc: '17px base',
    specimen: 'Aa',
    size: 'text-3xl',
  },
]

export function TypographySection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup
        title="Familia tipográfica"
        icon={<Type className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FUENTES.map(({ value, label, family, specimen }) => {
            const isSelected = prefs.tipografia === value
            return (
              <button
                key={value}
                onClick={() => onChange({ tipografia: value })}
                className={cn(
                  'flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <span
                  className={cn(
                    'text-2xl font-semibold leading-none tracking-tight',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                  style={{ fontFamily: family }}
                >
                  {specimen}
                </span>
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p
                    className="text-[10px] text-muted-foreground mt-0.5"
                    style={{ fontFamily: family }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
                {isSelected && (
                  <div className="h-0.5 w-full rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </SectionGroup>

      <SectionGroup
        title="Tamaño de fuente"
        icon={<span className="text-xs font-bold text-primary">Aa</span>}
      >
        <div className="flex gap-3">
          {TAMANIOS.map(({ value, label, desc, specimen, size }) => {
            const isSelected = prefs.tamanioFuente === value
            return (
              <button
                key={value}
                onClick={() => onChange({ tamanioFuente: value })}
                className={cn(
                  'flex flex-1 flex-col items-center gap-3 rounded-xl border-2 py-5 px-4 transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <span
                  className={cn(
                    'font-bold leading-none',
                    size,
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {specimen}
                </span>
                <div className="text-center">
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="rounded-lg bg-muted/40 px-4 py-3 border border-border/40">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            Vista previa del texto
          </p>
          <p
            className="text-foreground leading-relaxed"
            style={{
              fontSize:
                prefs.tamanioFuente === 'SMALL'
                  ? '13px'
                  : prefs.tamanioFuente === 'LARGE'
                    ? '17px'
                    : '15px',
            }}
          >
            Panel de administración · Kiki y Lala PEMS
          </p>
        </div>
      </SectionGroup>
    </div>
  )
}

function SectionGroup({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border/40">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}
