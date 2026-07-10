'use client'

import React from 'react'
import { PreferenciaAdmin } from '@/types/preferencias.types'
import { Bell, Mail, MonitorSmartphone, Volume2, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionGroup, ToggleRow } from './shared/SectionUI'

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
          {UI_PREFS.map(({ key, label, description }) => (
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
    </div>
  )
}
