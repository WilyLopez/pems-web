'use client'

import { PreferenciaAdmin, PrimerDiaSemana } from '@/types/preferencias.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Globe, Clock, Calendar, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const IDIOMAS = [
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
]

const ZONAS = [
  { value: 'America/Lima', label: 'Lima', offset: 'UTC−5' },
  { value: 'America/Bogota', label: 'Bogotá', offset: 'UTC−5' },
  { value: 'America/Mexico_City', label: 'Ciudad de México', offset: 'UTC−6' },
  { value: 'America/Santiago', label: 'Santiago', offset: 'UTC−3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC−3' },
  { value: 'America/New_York', label: 'Nueva York', offset: 'UTC−5/−4' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1/+2' },
]

const FORMATOS_FECHA = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
]

const FORMATOS_HORA = [
  { value: '24H', label: '24 horas', example: '14:30' },
  { value: '12H', label: '12 horas', example: '2:30 PM' },
]

const PRIMER_DIA: { value: PrimerDiaSemana; label: string; desc: string }[] = [
  { value: 'MONDAY', label: 'Lunes', desc: 'Lu Ma Mi Ju Vi Sá Do' },
  { value: 'SUNDAY', label: 'Domingo', desc: 'Do Lu Ma Mi Ju Vi Sá' },
]

export function LocalizationSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup title="Idioma" icon={<Globe className="h-4 w-4" />}>
        <div className="flex gap-3">
          {IDIOMAS.map(({ value, label, flag }) => {
            const isSelected = prefs.idioma === value
            return (
              <button
                key={value}
                onClick={() => onChange({ idioma: value })}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <span className="text-2xl">{flag}</span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </SectionGroup>

      <SectionGroup title="Zona horaria" icon={<Clock className="h-4 w-4" />}>
        <Select
          value={prefs.zonaHoraria}
          onValueChange={(v) => onChange({ zonaHoraria: v })}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZONAS.map(({ value, label, offset }) => (
              <SelectItem key={value} value={value}>
                <span>{label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {offset}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SectionGroup>

      <SectionGroup
        title="Formato de fecha y hora"
        icon={<Calendar className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Formato de fecha
            </p>
            <div className="space-y-1.5">
              {FORMATOS_FECHA.map(({ value, label, example }) => {
                const isSelected = prefs.formatoFecha === value
                return (
                  <button
                    key={value}
                    onClick={() => onChange({ formatoFecha: value })}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all duration-150',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-semibold font-mono',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {example}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Formato de hora
            </p>
            <div className="space-y-1.5">
              {FORMATOS_HORA.map(({ value, label, example }) => {
                const isSelected = prefs.formatoHora === value
                return (
                  <button
                    key={value}
                    onClick={() => onChange({ formatoHora: value })}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all duration-150',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {example}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup
        title="Primer día de la semana"
        icon={<CalendarDays className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 gap-3">
          {PRIMER_DIA.map(({ value, label, desc }) => {
            const isSelected = prefs.primerDiaSemana === value
            return (
              <button
                key={value}
                onClick={() => onChange({ primerDiaSemana: value })}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {desc}
                </span>
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
