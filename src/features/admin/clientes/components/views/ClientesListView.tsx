'use client'

import { useMemo } from 'react'
import { RefreshCw, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { ClienteFiltros } from '../table/ClienteFiltros'
import { createColumns } from '../table/columns'
import { ClienteDrawer } from '../ui/ClienteDrawer'
import { NuevoClienteModal } from '../forms/NuevoClienteModal'
import { useClientesList, useClienteDetail } from '../../hooks/useClientesData'
import { useClientesNav } from '../../hooks/useClientesNav'
import { OrigenCliente } from '../../types'

interface ClientesListViewProps {
  origenCreacion?: OrigenCliente
  mostrarAcciones?: boolean
  mostrarFiltroVerificados?: boolean
}

export function ClientesListView({
  origenCreacion = 'ADMIN',
  mostrarAcciones = true,
  mostrarFiltroVerificados = true,
}: ClientesListViewProps = {}) {
  const {
    page,
    size,
    search,
    filtro,
    drawerId,
    modal,
    setPage,
    setSize,
    setSearch,
    setFiltro,
    openDrawer,
    closeDrawer,
    openNuevoModal,
    closeNuevoModal,
  } = useClientesNav()

  const { data, isLoading, isError, refetch } = useClientesList()
  const { data: detailCliente } = useClienteDetail(drawerId)

  const selectedCliente = useMemo(() => {
    if (!drawerId) return null
    return data?.content.find((c) => c.id === drawerId) || detailCliente || null
  }, [drawerId, data?.content, detailCliente])

  const columns = useMemo(() => {
    return createColumns((c) => openDrawer(c.id))
  }, [openDrawer])

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <Breadcrumbs items={[{ label: 'Clientes' }]} />

      <PageHeader
        title="Clientes"
        description="Gestión CRM de clientes web, presenciales y corporativos"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={openNuevoModal}
            >
              <UserPlus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </div>
        }
      />

      <ClienteFiltros
        search={search}
        filtro={filtro}
        total={data?.totalElements}
        onSearchChange={setSearch}
        onFiltroChange={setFiltro}
        mostrarFiltroVerificados={mostrarFiltroVerificados}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron clientes con los filtros aplicados."
          onRowClick={(c) => openDrawer(c.id)}
        />

        {data && data.totalElements > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
            <DataTablePagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              size={data.size}
              onPageChange={setPage}
              onSizeChange={setSize}
              pageSizeOptions={[10, 15, 25, 50]}
            />
          </div>
        )}
      </div>

      <ClienteDrawer
        cliente={selectedCliente}
        onClose={closeDrawer}
        mostrarAcciones={mostrarAcciones}
      />

      <NuevoClienteModal
        open={modal === 'nuevo'}
        onOpenChange={(open) => (open ? openNuevoModal() : closeNuevoModal())}
        origen={origenCreacion}
      />
    </div>
  )
}
