'use client'

import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ErrorState } from '@/components/common/Errorstate'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useConfiguracion,
  useConfiguracionCalendario,
} from '../../hooks/useConfiguracionData'
import {
  useConfiguracionNav,
  SECCION_LABELS,
} from '../../hooks/useConfiguracionNav'
import { SystemHealthPanel } from '../shared/SystemHealthPanel'
import { OperacionSection } from '../sections/OperacionSection'
import { ReservasEventosSection } from '../sections/ReservasEventosSection'
import { SedeSection } from '../sections/SedeSection'
import { SeguridadSection } from '../sections/SeguridadSection'
import { SistemaSection } from '../sections/SistemaSection'
import { IntegracionesSection } from '../sections/IntegracionesSection'

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-2xl border border-border p-5 h-52 animate-pulse"
        />
      ))}
    </div>
  )
}

export function ConfiguracionView() {
  const { idSede } = useAuth()
  const { seccion, navPropsFor } = useConfiguracionNav()

  const {
    data: configs,
    isLoading: loadingGlobal,
    isError: errorGlobal,
    refetch: refetchGlobal,
  } = useConfiguracion()

  const {
    data: configCalendario,
    isLoading: loadingCalendario,
    isError: errorCalendario,
    refetch: refetchCalendario,
  } = useConfiguracionCalendario(idSede ?? null)

  const isLoading = loadingGlobal || loadingCalendario
  const isError = errorGlobal || errorCalendario

  function refetch() {
    refetchGlobal()
    refetchCalendario()
  }

  const breadcrumbItems = [
    {
      label: 'Configuración',
      href: seccion ? '/admin/configuracion' : undefined,
    },
    ...(seccion ? [{ label: SECCION_LABELS[seccion] }] : []),
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Configuración del sistema"
        description="Centro de control operativo y técnico del negocio"
      />

      {!idSede && !isLoading && (
        <Alert variant="destructive">
          <AlertDescription>
            Tu usuario no tiene una sede asignada. Contacta al administrador del
            sistema para continuar.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <GridSkeleton />
      ) : isError || !configs || !configCalendario ? (
        <ErrorState onRetry={refetch} />
      ) : !idSede ? null : (
        <>
          <SystemHealthPanel idSede={idSede} configs={configs} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <OperacionSection
              config={configCalendario}
              idSede={idSede}
              navProps={navPropsFor('operacion')}
            />
            <ReservasEventosSection
              config={configCalendario}
              idSede={idSede}
              navProps={navPropsFor('reservas-eventos')}
            />
            <SedeSection idSede={idSede} navProps={navPropsFor('sede')} />
            <SeguridadSection
              configs={configs}
              navProps={navPropsFor('seguridad')}
            />
            <SistemaSection
              configs={configs}
              navProps={navPropsFor('sistema')}
            />
            <IntegracionesSection
              idSede={idSede}
              navProps={navPropsFor('integraciones')}
            />
          </div>
        </>
      )}
    </div>
  )
}
