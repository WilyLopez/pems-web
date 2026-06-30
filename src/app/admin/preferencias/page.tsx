'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Type,
  Layout,
  Zap,
  MousePointer,
  LayoutDashboard,
  Bell,
  Globe,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'

import {
  useAdminPreferences,
  useParchearPreferencias,
  useResetPreferencias,
} from '@/hooks/useAdminPreferences'
import { useThemeConfig } from '@/hooks/useThemeConfig'
import { useAdminPreferencesStore } from '@/lib/store/admin-preferences.store'

import { AppearanceSection } from '@/components/admin/preferences/AppearanceSection'
import { TypographySection } from '@/components/admin/preferences/TypographySection'
import { LayoutSection } from '@/components/admin/preferences/LayoutSection'
import { AnimationsSection } from '@/components/admin/preferences/AnimationsSection'
import { BehaviorSection } from '@/components/admin/preferences/BehaviorSection'
import { DashboardSection } from '@/components/admin/preferences/DashboardSection'
import { NotificationSection } from '@/components/admin/preferences/NotificationSection'
import { LocalizationSection } from '@/components/admin/preferences/LocalizationSection'
import { PreviewPanel } from '@/components/admin/preferences/PreviewPanel'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PreferenciaAdmin } from '@/types/preferencias.types'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'tipografia', label: 'Tipografía', icon: Type },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'animaciones', label: 'Animaciones', icon: Zap },
  { id: 'comportamiento', label: 'Comportamiento', icon: MousePointer },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'localizacion', label: 'Localización', icon: Globe },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function PreferenciasSkeleton() {
  return (
    <div className="flex min-h-[560px]">
      <div className="w-52 shrink-0 border-r border-border p-3 space-y-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function PreferenciasPage() {
  const { isLoading, isError, refetch } = useAdminPreferences()
  const preferences = useAdminPreferencesStore((s) => s.preferences)
  const { patchDebounced } = useParchearPreferencias()
  const resetMutation = useResetPreferencias()
  const [confirmReset, setConfirmReset] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('apariencia')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useThemeConfig()

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

      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Mis preferencias"
          description="Personaliza tu experiencia en el panel de administración"
        />
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs text-emerald-600 transition-all duration-500',
              savedAt
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Guardado automáticamente</span>
          </div>
          {/* 
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer
          </Button>
          */}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex min-h-[600px]">
          {/*
          <nav className="w-52 shrink-0 border-r border-border bg-muted/30 p-3 space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background hover:shadow-sm'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              )
            })}
          </nav>
          */}

          <div className="flex-1 min-w-0 p-7 overflow-y-auto">
            {activeSection === 'apariencia' && (
              <AppearanceSection prefs={preferences} onChange={handleChange} />
            )}
            {/*
            {activeSection === 'tipografia' && (
              <TypographySection prefs={preferences} onChange={handleChange} />
            )}
            {activeSection === 'layout' && (
              <LayoutSection prefs={preferences} onChange={handleChange} />
            )}
            {activeSection === 'animaciones' && (
              <AnimationsSection prefs={preferences} onChange={handleChange} />
            )}
            {activeSection === 'comportamiento' && (
              <BehaviorSection prefs={preferences} onChange={handleChange} />
            )}
            {activeSection === 'dashboard' && (
              <DashboardSection prefs={preferences} onChange={handleChange} />
            )}
            {activeSection === 'notificaciones' && (
              <NotificationSection
                prefs={preferences}
                onChange={handleChange}
              />
            )}
            {activeSection === 'localizacion' && (
              <LocalizationSection
                prefs={preferences}
                onChange={handleChange}
              />
            )}
            */}
          </div>

          {/*
          <div className="hidden xl:flex w-64 shrink-0 border-l border-border bg-muted/20 p-5 flex-col">
            <PreviewPanel prefs={preferences} />
          </div>
          */}
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
