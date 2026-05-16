'use client'

import { PreferenciaAdmin } from '@/types/preferencias.types'
import { MousePointer, Table2, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

export function BehaviorSection({ prefs, onChange }: Props) {
  function handleElementos(delta: number) {
    const next = prefs.elementosPorTabla + delta
    if (next >= 5 && next <= 100) onChange({ elementosPorTabla: next })
  }

  return (
    <div className="space-y-5">
      <SectionGroup
        title="Navegación y sesión"
        icon={<MousePointer className="h-4 w-4" />}
      >
        <ToggleRow
          label="Confirmar acciones destructivas"
          description="Muestra un diálogo de confirmación antes de eliminar o revertir datos"
          checked={prefs.confirmarAcciones}
          onChange={(v) => onChange({ confirmarAcciones: v })}
        />
        <ToggleRow
          label="Recordar última página"
          description="Al iniciar sesión, redirige a la última página que visitaste"
          checked={prefs.recordarUltimaPagina}
          onChange={(v) => onChange({ recordarUltimaPagina: v })}
        />
        <ToggleRow
          label="Restaurar tabs abiertos"
          description="Recupera las pestañas abiertas de la sesión anterior"
          checked={prefs.restaurarTabs}
          onChange={(v) => onChange({ restaurarTabs: v })}
        />
      </SectionGroup>

      <SectionGroup
        title="Tablas y listas"
        icon={<Table2 className="h-4 w-4" />}
      >
        <p className="text-xs text-muted-foreground -mt-1">
          Número de filas mostradas por defecto en todas las tablas paginadas.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-input bg-background overflow-hidden">
            <button
              onClick={() => handleElementos(-5)}
              disabled={prefs.elementosPorTabla <= 5}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="flex h-10 w-16 items-center justify-center border-x border-input">
              <span className="text-sm font-semibold tabular-nums">
                {prefs.elementosPorTabla}
              </span>
            </div>
            <button
              onClick={() => handleElementos(5)}
              disabled={prefs.elementosPorTabla >= 100}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {[10, 20, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => onChange({ elementosPorTabla: n })}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                  prefs.elementosPorTabla === n
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40'
                )}
              >
                {n}
              </button>
            ))}
          </div>
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
