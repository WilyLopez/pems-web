'use client'

import React, { useState } from 'react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { List, PlusCircle } from 'lucide-react'
import { useVentasNav } from '../../hooks/useVentasNav'
import { useVentas } from '../../hooks/useVentasData'
import { useAuth } from '@/hooks/useAuth'
import { VentaMostradorView } from './VentaMostradorView'
import { VentasTable } from '../table/VentasTable'
import { VentasFilters } from '../table/VentasFilters'
import { VentaDetailDrawer } from '../modals/VentaDetailDrawer'

export const VentasListView = () => {
  const { idSede } = useAuth()
  const {
    page,
    size,
    search,
    desde,
    hasta,
    tab,
    setPage,
    setSize,
    setSearch,
    setDesde,
    setHasta,
    setTab,
  } = useVentasNav()

  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null)

  const { data, isError, refetch } = useVentas({
    idSede: idSede ?? undefined,
    page,
    size,
    search: search || undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
  })

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Ventas' }]} />

      <PageHeader
        title="Gestión de Ventas"
        description="Registro de ventas en mostrador e historial de transacciones"
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="bg-gray-100/80 border-none p-1 h-11">
          <TabsTrigger 
            value="lista" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 gap-2 text-xs font-bold"
          >
            <List className="h-4 w-4" /> Historial
          </TabsTrigger>
          <TabsTrigger 
            value="nueva" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 gap-2 text-xs font-bold"
          >
            <PlusCircle className="h-4 w-4" /> Nueva Venta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <VentasFilters
            search={search}
            desde={desde}
            hasta={hasta}
            onSearchChange={setSearch}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
          />

          {isError ? (
            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-semibold text-red-600">Error al cargar el historial de ventas.</p>
              <button onClick={() => refetch()} className="text-xs font-bold text-red-500 hover:underline mt-2">
                Reintentar
              </button>
            </div>
          ) : (
            <VentasTable
              data={data}
              page={page}
              size={size}
              onPageChange={setPage}
              onSizeChange={setSize}
              onViewVenta={(id) => setSelectedVentaId(Number(id))}
            />
          )}
        </TabsContent>

        <TabsContent value="nueva">
          <VentaMostradorView />
        </TabsContent>
      </Tabs>

      <VentaDetailDrawer
        ventaId={selectedVentaId}
        onClose={() => setSelectedVentaId(null)}
      />
    </div>
  )
}

