'use client'

import { useState } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useConfiguracionAdmin } from '@/hooks/useConfiguracionPublica'
import { NegocioSection } from '../components/sections/NegocioSection'
import { ContactoSection } from '../components/sections/ContactoSection'
import { LogosSection } from '../components/sections/LogosSection'
import { RedesSection } from '../components/sections/RedesSection'
import { SeoSection } from '../components/sections/SeoSection'
import { VisualSection } from '../components/sections/VisualSection'
import { useConfiguracionPublicaNav } from '../hooks/useConfiguracionPublicaNav'
import { useConfiguracionPublicaForm } from '../hooks/useConfiguracionPublicaForm'
import { NAV_ITEMS, type SectionId } from '../types'

function isSectionIncomplete(
  id: SectionId,
  config: ReturnType<typeof useConfiguracionAdmin>['data']
): boolean {
  if (!config) return false
  if (id === 'contacto') return !config.correo && !config.telefono
  if (id === 'logos') return !config.logoUrl
  if (id === 'seo') return !config.metaTitle || !config.metaDescription
  return false
}

export function ConfiguracionPublicaView() {
  const { seccion, navegar } = useConfiguracionPublicaNav()
  const { form, isLoading, isError, refetch, isPending, onSubmit, isDirty } =
    useConfiguracionPublicaForm()
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null)
  const { data: config } = useConfiguracionAdmin()

  const {
    register,
    control,
    formState: { errors },
  } = form

  function handleNavClick(id: SectionId) {
    if (isDirty && id !== seccion) {
      setPendingSection(id)
    } else {
      navegar(id)
    }
  }

  function confirmNavigation() {
    if (pendingSection) {
      form.reset()
      navegar(pendingSection)
      setPendingSection(null)
    }
  }

  const activeLabel =
    NAV_ITEMS.find((n) => n.id === seccion)?.label ?? 'Negocio'

  const breadcrumbs = [
    { label: 'CMS', href: '/admin/cms' },
    {
      label: 'Configuración Pública',
      href: '/admin/cms/configuracion-publica',
    },
    { label: activeLabel },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="flex gap-5">
          <Skeleton className="h-80 w-48 rounded-xl shrink-0" />
          <Skeleton className="h-80 flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbs} />

      <PageHeader
        title="Configuración Pública"
        description="Identidad, branding, redes sociales y SEO del sitio web"
        actions={
          <Button
            type="submit"
            form="config-publica-form"
            disabled={isPending || !isDirty}
            className="bg-brand-azul text-white gap-1.5"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        }
      />

      <form id="config-publica-form" onSubmit={onSubmit}>
        <div className="flex gap-5 min-h-[500px]">
          <aside className="w-48 shrink-0">
            <nav
              className="space-y-0.5 sticky top-4"
              aria-label="Secciones de configuración"
            >
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const incomplete = isSectionIncomplete(id, config)
                const isActive = seccion === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => handleNavClick(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul focus-visible:ring-offset-1 ${
                      isActive
                        ? 'bg-brand-azul text-white font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {incomplete && !isActive && (
                      <span
                        className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                        title="Sección incompleta"
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {seccion === 'negocio' && (
              <NegocioSection register={register} errors={errors} />
            )}
            {seccion === 'contacto' && (
              <ContactoSection
                register={register}
                errors={errors}
                control={control}
              />
            )}
            {seccion === 'logos' && <LogosSection control={control} />}
            {seccion === 'redes' && (
              <RedesSection register={register} errors={errors} />
            )}
            {seccion === 'seo' && (
              <SeoSection
                register={register}
                control={control}
                errors={errors}
              />
            )}
            {seccion === 'visual' && <VisualSection control={control} />}
          </div>
        </div>

        {isDirty && (
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/95 dark:bg-amber-950/80 dark:border-amber-800 backdrop-blur px-4 py-3 mt-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Tienes cambios sin guardar
            </div>
            <Button
              type="submit"
              form="config-publica-form"
              size="sm"
              disabled={isPending}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </form>

      <ConfirmDialog
        open={pendingSection !== null}
        onOpenChange={(v) => !v && setPendingSection(null)}
        title="Cambios sin guardar"
        description="Tienes cambios sin guardar en esta sección. ¿Descartar los cambios y continuar?"
        confirmLabel="Descartar y continuar"
        destructive={false}
        onConfirm={confirmNavigation}
      />
    </div>
  )
}
