'use client'

import { PreferenciaAdmin, TemaAdmin } from '@/types/preferencias.types'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Sun, Moon, Monitor, Palette, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const COLOR_FIELDS: {
  key: keyof Pick<
    PreferenciaAdmin,
    'colorPrimario' | 'colorSecundario' | 'colorSidebar' | 'colorAcento'
  >
  label: string
  placeholder: string
}[] = [
  { key: 'colorPrimario', label: 'Color primario', placeholder: '#00AEEF' },
  { key: 'colorSecundario', label: 'Color secundario', placeholder: '#F64B8A' },
  { key: 'colorSidebar', label: 'Color sidebar', placeholder: '#ffffff' },
  { key: 'colorAcento', label: 'Color acento', placeholder: '#6EE7B7' },
]

export function AppearanceSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup
        title="Tema de la interfaz"
        icon={<Sun className="h-4 w-4" />}
      >
        <div className="grid grid-cols-3 gap-3">
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

      <SectionGroup
        title="Colores personalizados"
        icon={<Palette className="h-4 w-4" />}
      >
        <p className="text-xs text-muted-foreground -mt-1">
          Deja vacío para usar los colores predeterminados del tema.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_FIELDS.map(({ key, label, placeholder }) => (
            <ColorField
              key={key}
              label={label}
              value={(prefs[key] as string | null) ?? ''}
              placeholder={placeholder}
              onChange={(v) => onChange({ [key]: v || null })}
            />
          ))}
        </div>
      </SectionGroup>

      <SectionGroup
        title="Accesibilidad visual"
        icon={<Eye className="h-4 w-4" />}
      >
        <ToggleRow
          label="Alto contraste"
          description="Aumenta el contraste para mejor legibilidad"
          checked={prefs.altoContraste}
          onChange={(v) => onChange({ altoContraste: v })}
        />
        <ToggleRow
          label="Cursor grande"
          description="Amplía el cursor del ratón"
          checked={prefs.cursorGrande}
          onChange={(v) => onChange({ cursorGrande: v })}
        />
      </SectionGroup>
    </div>
  )
}

function ColorField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0 outline-none"
        />
        <div className="h-4 w-px bg-border" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:ring-0"
        />
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
