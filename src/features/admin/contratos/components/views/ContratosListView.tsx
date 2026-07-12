'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Eye, X, RefreshCw } from 'lucide-react'
import { Contrato } from '../../types'
import { useContratos } from '../../hooks/useContratos'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatDateTime, formatCurrency, cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'

export function ContratosListView() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [fecha, setFecha] = useState('')

  const { data, isLoading, isError, refetch } = useContratos({
    page,
    size: 15,
    fechaEvento: fecha || undefined,
  })

  const columns: ColumnDef<Contrato>[] = [
    {
      accessorKey: 'id',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase">#</span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">
          C-{String(row.original.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      accessorKey: 'nombreCliente',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-brand-azul"
        >
          Cliente <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
            {row.original.nombreCliente ?? '—'}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[160px]">
            {row.original.tipoEvento ?? ''}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'fechaEvento',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Fecha evento
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.fechaEvento
            ? formatDate(row.original.fechaEvento)
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'precioTotalContrato',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Total
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.original.precioTotalContrato
            ? formatCurrency(row.original.precioTotalContrato)
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'saldoPendiente',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Saldo
        </span>
      ),
      cell: ({ row }) => {
        const saldo = row.original.saldoPendiente ?? 0
        return (
          <span
            className={cn(
              'text-sm font-semibold',
              saldo > 0 ? 'text-amber-700' : 'text-green-700'
            )}
          >
            {saldo > 0 ? formatCurrency(saldo) : 'Pagado'}
          </span>
        )
      },
    },
    {
      accessorKey: 'fechaCarga',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Cargado
        </span>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-xs text-gray-600">
            {row.original.fechaCarga
              ? formatDateTime(row.original.fechaCarga)
              : '—'}
          </p>
          <p className="text-[11px] text-gray-400">
            {row.original.usuarioCarga ?? ''}
          </p>
        </div>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg gap-1.5 text-xs text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8"
          onClick={(e) => {
            e.stopPropagation()
            router.push(ADMIN_ROUTES.contratoDetalle(row.original.idEventoPrivado))
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Button>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Contratos' }]} />

      <PageHeader
        title="Contratos"
        description="Contratos en PDF cargados por evento privado"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value)
              setPage(0)
            }}
            className="h-10 rounded-xl border-gray-200 w-44 pr-8"
          />
          {fecha && (
            <button
              onClick={() => {
                setFecha('')
                setPage(0)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {data?.totalElements !== undefined && (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 h-10 px-3 text-sm self-start sm:self-auto"
          >
            {data.totalElements} contratos
          </Badge>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron contratos con los filtros aplicados."
          onRowClick={(contrato) =>
            router.push(ADMIN_ROUTES.contratoDetalle(contrato.idEventoPrivado))
          }
        />
      </div>

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
