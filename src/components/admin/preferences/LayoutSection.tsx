'use client'

import {
  PreferenciaAdmin,
  RadiosBordes,
  AnchoContenido,
} from '@/types/preferencias.types'
import {
  PanelLeft,
  AlignJustify,
  Maximize2,
  BoxSelect,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const RADIOS: {
  value: RadiosBordes
  label: string
  desc: string
  radius: string
}[] = [
  { value: 'SMALL', label: 'Cuadrado', desc: '4px', radius: 'rounded' },
  { value: 'NORMAL', label: 'Redondeado', desc: '8px', radius: 'rounded-lg' },
  { value: 'LARGE', label: 'Circular', desc: '16px', radius: 'rounded-2xl' },
]

const ANCHOS: {
  value: AnchoContenido
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    value: 'BOXED',
    label: 'Centrado',
    desc: 'Ancho máximo con márgenes laterales',
    icon: BoxSelect,
  },
  {
    value: 'FULL',
    label: 'Completo',
    desc: 'Ocupa todo el ancho disponible',
    icon: Maximize2,
  },
]

export function LayoutSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup title="Sidebar" icon={<PanelLeft className="h-4 w-4" />}>
        <ToggleRow
          label="Colapsado por defecto"
          description="El sidebar inicia en modo compacto al abrir el panel"
          checked={prefs.sidebarColapsado}
          onChange={(v) => onChange({ sidebarColapsado: v })}
        />
        <ToggleRow
          label="Sidebar flotante"
          description="El sidebar flota sobre el contenido en dispositivos móviles"
          checked={prefs.sidebarFlotante}
          onChange={(v) => onChange({ sidebarFlotante: v })}
        />
        <ToggleRow
          label="Mostrar íconos del menú"
          description="Muestra íconos junto a los items de navegación"
          checked={prefs.mostrarIconosMenu}
          onChange={(v) => onChange({ mostrarIconosMenu: v })}
        />
      </SectionGroup>

      <SectionGroup
        title="Contenido"
        icon={<AlignJustify className="h-4 w-4" />}
      >
        <ToggleRow
          label="Modo compacto"
          description="Reduce el espaciado entre elementos de la interfaz"
          checked={prefs.modoCompacto}
          onChange={(v) => onChange({ modoCompacto: v })}
        />
        <ToggleRow
          label="Mostrar migas de pan"
          description="Muestra la ruta de navegación en la parte superior de cada página"
          checked={prefs.mostrarMigaspan}
          onChange={(v) => onChange({ mostrarMigaspan: v })}
        />
        <ToggleRow
          label="Mayor espaciado"
          description="Aumenta el espaciado entre elementos (mejora la accesibilidad)"
          checked={prefs.aumentarEspaciado}
          onChange={(v) => onChange({ aumentarEspaciado: v })}
        />
      </SectionGroup>

      <SectionGroup
        title="Ancho de contenido"
        icon={<Maximize2 className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 gap-3">
          {ANCHOS.map(({ value, label, desc, icon: Icon }) => {
            const isSelected = prefs.anchoContenido === value
            return (
              <button
                key={value}
                onClick={() => onChange({ anchoContenido: value })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </SectionGroup>

      <SectionGroup
        title="Radio de bordes"
        icon={<Circle className="h-4 w-4" />}
      >
        <div className="flex gap-3">
          {RADIOS.map(({ value, label, desc, radius }) => {
            const isSelected = prefs.radiosBordes === value
            return (
              <button
                key={value}
                onClick={() => onChange({ radiosBordes: value })}
                className={cn(
                  'flex flex-1 flex-col items-center gap-3 border-2 py-4 px-3 transition-all duration-150',
                  radius,
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'h-10 w-10 border-2',
                    radius,
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/40 bg-muted/40'
                  )}
                />
                <div className="text-center">
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </button>
            )
          })}
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
