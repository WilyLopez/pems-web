'use client'

import { PreferenciaAdmin } from '@/types/preferencias.types'
import { Bell, Mail, MonitorSmartphone, Volume2, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
  onChange: (patch: Partial<PreferenciaAdmin>) => void
}

const CANALES: {
  key: keyof PreferenciaAdmin
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  {
    key: 'notificacionesPush',
    label: 'Notificaciones push',
    description: 'Alertas en tiempo real en el navegador',
    icon: MonitorSmartphone,
    color: 'text-blue-500',
  },
  {
    key: 'notificacionesEmail',
    label: 'Correo electrónico',
    description: 'Recibe alertas importantes en tu bandeja de entrada',
    icon: Mail,
    color: 'text-violet-500',
  },
]

const UI_PREFS: {
  key: keyof PreferenciaAdmin
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    key: 'notificacionesVisuales',
    label: 'Notificaciones visuales',
    description: 'Toasts y banners dentro de la aplicación',
    icon: Bell,
  },
  {
    key: 'sonidoNotificaciones',
    label: 'Sonido',
    description: 'Reproduce un sonido al recibir notificaciones',
    icon: Volume2,
  },
  {
    key: 'badgesDinamicos',
    label: 'Badges dinámicos',
    description: 'Muestra contadores de elementos no leídos en el menú',
    icon: CircleDot,
  },
]

export function NotificationSection({ prefs, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SectionGroup
        title="Canales de notificación"
        icon={<Bell className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CANALES.map(({ key, label, description, icon: Icon, color }) => {
            const isActive = prefs[key] as boolean
            return (
              <button
                key={key}
                onClick={() => onChange({ [key]: !isActive })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    isActive ? 'bg-primary/15' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? color : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>
                <div
                  className={cn(
                    'mt-1 h-2 w-2 shrink-0 rounded-full',
                    isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              </button>
            )
          })}
        </div>
      </SectionGroup>

      <SectionGroup
        title="Preferencias de interfaz"
        icon={<MonitorSmartphone className="h-4 w-4" />}
      >
        <div className="space-y-1 divide-y divide-border/40">
          {UI_PREFS.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={prefs[key] as boolean}
                  onClick={() => onChange({ [key]: !(prefs[key] as boolean) })}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                    (prefs[key] as boolean)
                      ? 'bg-primary shadow-sm shadow-primary/30'
                      : 'bg-input'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
                      (prefs[key] as boolean)
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
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
