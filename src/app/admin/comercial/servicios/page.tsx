'use client'

import { useState } from 'react'
import { Plus, LayoutGrid } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useServiciosCotizacionAdmin,
  useServicioCotizacionMutations,
} from '@/features/admin/comercial/servicios/hooks/useServicios'
import { ServicioFormDialog } from '@/features/admin/comercial/servicios/components/ServicioFormDialog'
import { ServicioCard } from '@/features/admin/comercial/servicios/components/ServicioCard'
import { ServicioCotizacion } from '@/types/comercial.types'

export default function ServiciosCotizacionPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServicioCotizacion | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    data: servicios = [],
    isLoading,
    isError,
    refetch,
  } = useServiciosCotizacionAdmin()
  const { eliminar } = useServicioCotizacionMutations()

  function handleOpenForm(s: ServicioCotizacion | null = null) {
    setEditTarget(s)
    setFormOpen(true)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Comercial', href: '/admin/comercial' },
          { label: 'Servicios de Cotización' },
        ]}
      />

      <PageHeader
        title="Servicios de Cotización"
        description="Catálogo de servicios extras que se pueden incluir en presupuestos de eventos"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul text-white gap-1.5"
            onClick={() => handleOpenForm()}
          >
            <Plus className="h-4 w-4" /> Nuevo servicio
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : servicios.length === 0 ? (
        <EmptyState
          title="Sin servicios"
          description="Crea servicios adicionales para las cotizaciones de eventos."
          icon={<LayoutGrid className="h-10 w-10 text-muted-foreground" />}
          action={
            <Button onClick={() => handleOpenForm()}>Crear servicio</Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios
            .sort((a, b) => a.orden - b.orden)
            .map((s) => (
              <ServicioCard
                key={s.id}
                servicio={s}
                onEdit={handleOpenForm}
                onDelete={setDeleteId}
              />
            ))}
        </div>
      )}

      <ServicioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        servicio={editTarget}
        siguienteOrden={servicios.length}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar servicio"
        description="El servicio será eliminado del catálogo de cotización."
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
