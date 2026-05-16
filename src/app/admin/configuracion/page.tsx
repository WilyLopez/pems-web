'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { OperacionTab } from '@/components/admin/configuracion/OperacionTab'
import { ReservasTab } from '@/components/admin/configuracion/ReservasTab'
import { EventosTab } from '@/components/admin/configuracion/EventosTab'
import { SeguridadTab } from '@/components/admin/configuracion/SeguridadTab'
import { PagosTab } from '@/components/admin/configuracion/PagosTab'
import { SedeTab } from '@/components/admin/configuracion/SedeTab'
import { CatalogosTab } from '@/components/admin/configuracion/CatalogosTab'

function ConfigSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-2xl rounded-lg" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

const TABS = [
  { value: 'operacion', label: 'Operación' },
  { value: 'reservas', label: 'Reservas' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'sede', label: 'Sede' },
  { value: 'catalogos', label: 'Catálogos' },
]

export default function ConfiguracionPage() {
  const { data: configs, isLoading, isError, refetch } = useConfiguracion()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Configuración' }]} />

      <PageHeader
        title="Configuración del sistema"
        description="Centro de control operativo y técnico del negocio"
      />

      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <ConfigSkeleton />
        </div>
      ) : isError || !configs ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <Tabs defaultValue="operacion">
            <TabsList className="flex-wrap h-auto gap-1 mb-6 w-full justify-start bg-gray-100/80">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="operacion">
              <OperacionTab configs={configs} />
            </TabsContent>

            <TabsContent value="reservas">
              <ReservasTab configs={configs} />
            </TabsContent>

            <TabsContent value="eventos">
              <EventosTab configs={configs} />
            </TabsContent>

            <TabsContent value="seguridad">
              <SeguridadTab configs={configs} />
            </TabsContent>

            <TabsContent value="pagos">
              <PagosTab configs={configs} />
            </TabsContent>

            <TabsContent value="sede">
              <SedeTab />
            </TabsContent>

            <TabsContent value="catalogos">
              <CatalogosTab />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
