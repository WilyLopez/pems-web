'use client'

import { PreferenciaAdmin } from '@/types/preferencias.types'
import { RefreshCw, LayoutDashboard, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const INTERVALOS = [
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 600, label: '10m' },
]

export function DashboardSection({ prefs, onChange }: Props) {
  function handleIntervalo(delta: number) {
    const next = prefs.intervaloRefreshSeg + delta
    if (next >= 10 && next <= 3600) onChange({ intervaloRefreshSeg: next })
  }

  return (
    <div className="space-y-5">
      <SectionGroup
        title="Actualización automática"
        icon={<RefreshCw className="h-4 w-4" />}
      >
        <ToggleRow
          label="Auto-refresh del dashboard"
          description="Actualiza automáticamente los datos sin necesidad de recargar la página"
          checked={prefs.autoRefreshDashboard}
          onChange={(v) => onChange({ autoRefreshDashboard: v })}
        />

        {prefs.autoRefreshDashboard && (
          <div className="rounded-lg border border-border/60 bg-background p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Intervalo de actualización
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-input bg-background overflow-hidden">
                <button
                  onClick={() => handleIntervalo(-10)}
                  disabled={prefs.intervaloRefreshSeg <= 10}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="flex h-9 w-20 items-center justify-center border-x border-input">
                  <span className="text-sm font-semibold tabular-nums">
                    {prefs.intervaloRefreshSeg >= 60
                      ? `${Math.floor(prefs.intervaloRefreshSeg / 60)}m ${prefs.intervaloRefreshSeg % 60 > 0 ? `${prefs.intervaloRefreshSeg % 60}s` : ''}`
                      : `${prefs.intervaloRefreshSeg}s`}
                  </span>
                </div>
                <button
                  onClick={() => handleIntervalo(10)}
                  disabled={prefs.intervaloRefreshSeg >= 3600}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="flex gap-1.5">
                {INTERVALOS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onChange({ intervaloRefreshSeg: value })}
                    className={cn(
                      'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all',
                      prefs.intervaloRefreshSeg === value
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionGroup>

      <SectionGroup
        title="Personalización de widgets"
        icon={<LayoutDashboard className="h-4 w-4" />}
      >
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Configuración desde el dashboard
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              La disposición de widgets, accesos rápidos y columnas se configura
              directamente en el panel principal. Arrastra y suelta los widgets
              para reorganizarlos.
            </p>
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
