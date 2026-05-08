'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Search, RefreshCw, Crown, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Cliente } from '@/types/cliente.types'
import { clienteService } from '@/services/cliente.service'
import { useDebounce } from '@/hooks/useDebounce'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default function ClientesPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes', page, debouncedSearch],
    queryFn: () => clienteService.listar({ page, size: 15, search: debouncedSearch || undefined }),
  })

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'nombre',
      header: 'Cliente',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-sm">{row.original.nombre}</p>
            <p className="text-xs text-muted-foreground">{row.original.correo}</p>
          </div>
          {row.original.esVip && (
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
    },
    {
      accessorKey: 'dni',
      header: 'DNI',
      cell: ({ row }) => row.original.dni ?? '—',
    },
    {
      accessorKey: 'contadorVisitas',
      header: 'Visitas',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.contadorVisitas}</Badge>
      ),
    },
    {
      accessorKey: 'correoVerificado',
      header: 'Verificado',
      cell: ({ row }) =>
        row.original.correoVerificado
          ? <CheckCircle className="h-4 w-4 text-green-600" />
          : <XCircle className="h-4 w-4 text-muted-foreground" />,
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Registro',
      cell: ({ row }) => formatDate(row.original.fechaCreacion),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clientes"
        description="Base de clientes registrados en el sistema"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, correo o DNI..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage="No se encontraron clientes con los filtros seleccionados."
      />

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page} totalPages={data.totalPages}
          totalElements={data.totalElements} size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}