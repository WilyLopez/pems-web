'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, Search, Tag } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useServiciosCotizacionAdmin,
  useServicioCotizacionMutations,
} from '@/features/admin/comercial/servicios/hooks/useServicios'
import { useCategoriasServicioAdmin } from '@/features/admin/comercial/servicios/hooks/useCategoriasServicio'
import { ServicioFormDialog } from '@/features/admin/comercial/servicios/components/ServicioFormDialog'
import { ServicioCard } from '@/features/admin/comercial/servicios/components/ServicioCard'
import { ServicioCotizacion } from '@/types/comercial.types'

export default function ServiciosCotizacionPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServicioCotizacion | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>(
    'todas'
  )

  const {
    data: servicios = [],
    isLoading,
    isError,
    refetch,
  } = useServiciosCotizacionAdmin()
  const { data: categorias = [] } = useCategoriasServicioAdmin()
  const { eliminar } = useServicioCotizacionMutations()

  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    let lista = termino
      ? servicios.filter((s) => s.nombre.toLowerCase().includes(termino))
      : servicios
    if (categoriaFiltro !== 'todas') {
      lista = lista.filter((s) => s.categoriaId === categoriaFiltro)
    }
    return [...lista].sort((a, b) => a.orden - b.orden)
  }, [servicios, busqueda, categoriaFiltro])

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
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/comercial/servicios/categorias">
                <Tag className="h-4 w-4" /> Categorías
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => handleOpenForm()}
            >
              <Plus className="h-4 w-4" /> Nuevo servicio
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative sm:max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar servicio por nombre…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            {categorias.length > 0 && (
              <select
                value={categoriaFiltro}
                onChange={(e) =>
                  setCategoriaFiltro(
                    e.target.value === 'todas'
                      ? 'todas'
                      : Number(e.target.value)
                  )
                }
                className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {serviciosFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No se encontraron servicios con ese nombre.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serviciosFiltrados.map((s) => (
                <ServicioCard
                  key={s.id}
                  servicio={s}
                  onEdit={handleOpenForm}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
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
