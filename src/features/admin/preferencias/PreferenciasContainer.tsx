'use client'

import React, { useState, useEffect } from 'react'
import { Palette, Type, Bell, RotateCcw, CheckCircle2 } from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

import {
  useAdminPreferences,
  useParchearPreferencias,
  useResetPreferencias,
} from '@/hooks/useAdminPreferences'
import { useAdminPreferencesStore } from '@/lib/store/admin-preferences.store'
import { PreferenciaAdmin } from '@/types/preferencias.types'
import { cn } from '@/lib/utils'

import { ThemeSection } from './components/ThemeSection'
import { TypographySection } from './components/TypographySection'
import { NotificationSection } from './components/NotificationSection'

const SECTIONS = [
  { id: 'tema', label: 'Tema', icon: Palette },
  { id: 'tipografia', label: 'Tipografía', icon: Type },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function PreferenciasSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}

export function PreferenciasContainer() {
  const { isLoading, isError, refetch } = useAdminPreferences()
  const preferences = useAdminPreferencesStore((s) => s.preferences)
  const { patchDebounced } = useParchearPreferencias()
  const resetMutation = useResetPreferencias()
  const [confirmReset, setConfirmReset] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('tema')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  function handleChange(patch: Partial<PreferenciaAdmin>) {
    patchDebounced(patch)
    setSavedAt(new Date())
  }

  useEffect(() => {
    if (!savedAt) return
    const timer = setTimeout(() => setSavedAt(null), 3000)
    return () => clearTimeout(timer)
  }, [savedAt])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mis preferencias"
          description="Personaliza tu experiencia en el panel de administración"
        />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <PreferenciasSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !preferences) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mis preferencias"
          description="Personaliza tu experiencia en el panel de administración"
        />
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Mis preferencias' }]} />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Mis preferencias"
          description="Personaliza tu experiencia en el panel de administración"
        />
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 transition-all duration-500',
              savedAt
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Guardado automáticamente</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 dark:border-destructive/40"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden p-5 sm:p-7 space-y-6">
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        <div>
          {activeSection === 'tema' && (
            <ThemeSection prefs={preferences} onChange={handleChange} />
          )}
          {activeSection === 'tipografia' && (
            <TypographySection prefs={preferences} onChange={handleChange} />
          )}
          {activeSection === 'notificaciones' && (
            <NotificationSection prefs={preferences} onChange={handleChange} />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Restablecer preferencias"
        description="Se restaurarán todos los valores a los predeterminados del sistema. Esta acción no se puede deshacer."
        confirmLabel="Restablecer"
        loading={resetMutation.isPending}
        onConfirm={() => {
          resetMutation.mutate(undefined, {
            onSettled: () => setConfirmReset(false),
          })
        }}
      />
    </div>
  )
}
