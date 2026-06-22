'use client'

import { PreferenciaAdmin } from '@/types/preferencias.types'
import { Zap, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const ANIMATION_TOGGLES: {
  key: keyof PreferenciaAdmin
  label: string
  description: string
}[] = [
  {
    key: 'mostrarAnimaciones',
    label: 'Animaciones generales',
    description: 'Habilita transiciones y animaciones en la interfaz',
  },
  {
    key: 'animacionSidebar',
    label: 'Animación del sidebar',
    description: 'Anima la apertura y cierre del sidebar',
  },
  {
    key: 'hoverEffects',
    label: 'Efectos hover',
    description: 'Efectos visuales al pasar el cursor sobre elementos',
  },
  {
    key: 'loadersAnimados',
    label: 'Loaders animados',
    description: 'Muestra spinners y esqueletos animados al cargar contenido',
  },
]

export function AnimationsSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup
        title="Animaciones e interacciones"
        icon={<Zap className="h-4 w-4" />}
      >
        <p className="text-xs text-muted-foreground -mt-1 leading-relaxed">
          Controla el comportamiento visual de la interfaz. Habilitar
          animaciones mejora la experiencia de uso.
        </p>
        <div className="space-y-1 divide-y divide-border/40">
          {ANIMATION_TOGGLES.map(({ key, label, description }) => (
            <div key={key} className="py-3 first:pt-0 last:pb-0">
              <ToggleRow
                label={label}
                description={description}
                checked={prefs[key] as boolean}
                onChange={(v) => onChange({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </SectionGroup>

      <div
        className={cn(
          'flex gap-3 rounded-xl border-2 p-4 transition-all duration-150',
          prefs.reducirAnimaciones
            ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
            : 'border-border bg-muted/20 hover:border-primary/40'
        )}
      >
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            prefs.reducirAnimaciones
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex flex-1 items-start justify-between gap-4">
          <div className="flex-1">
            <p
              className={cn(
                'text-sm font-semibold',
                prefs.reducirAnimaciones
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-foreground'
              )}
            >
              Reducir animaciones
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Minimiza todos los movimientos. Recomendado para personas con
              sensibilidad al movimiento o para mejorar el rendimiento.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={prefs.reducirAnimaciones}
            onClick={() =>
              onChange({ reducirAnimaciones: !prefs.reducirAnimaciones })
            }
            className={cn(
              'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              prefs.reducirAnimaciones ? 'bg-amber-500' : 'bg-input'
            )}
          >
            <span
              className={cn(
                'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
                prefs.reducirAnimaciones ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          checked ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-input'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
