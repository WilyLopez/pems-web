'use client'

import React, { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { useVentasNav } from '../../hooks/useVentasNav'
import { useVentas } from '../../hooks/useVentasData'
import { useAuth } from '@/hooks/useAuth'
import { VentasTable } from '../table/VentasTable'
import { VentasFilters } from '../table/VentasFilters'
import { VentaDetailDrawer } from '../modals/VentaDetailDrawer'

export const VentasListView = () => {
  const { idSede } = useAuth()
  const router = useRouter()
  const {
    page,
    size,
    search,
    desde,
    hasta,
    tipo,
    setPage,
    setSize,
    setSearch,
    setDesde,
    setHasta,
    setTipo,
  } = useVentasNav()

  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useVentas({
    idSede: idSede ?? undefined,
    page,
    size,
    search: search || undefined,
    tipo: tipo || undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
  })

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Ventas' }]} />

      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Ventas"
          description="Historial de transacciones y registro de ventas en caja"
        />
        <Button
          onClick={() => router.push('/admin/ventas/nueva')}
          className="shrink-0 gap-2 bg-brand-azul hover:bg-brand-azul/90 text-white h-10 px-5 rounded-xl font-bold text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      <VentasFilters
        search={search}
        desde={desde}
        hasta={hasta}
        tipo={tipo}
        onSearchChange={setSearch}
        onDesdeChange={setDesde}
        onHastaChange={setHasta}
        onTipoChange={setTipo}
      />

      {isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            Error al cargar el historial de ventas.
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline mt-2"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <VentasTable
          data={data}
          isLoading={isLoading}
          page={page}
          size={size}
          onPageChange={setPage}
          onSizeChange={setSize}
          onViewVenta={(id) => setSelectedVentaId(Number(id))}
        />
      )}

      <VentaDetailDrawer
        ventaId={selectedVentaId}
        onClose={() => setSelectedVentaId(null)}
      />

    </div>
  )
}
