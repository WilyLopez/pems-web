// app/admin/clientes/page.tsx

'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, ArrowUpDown, Eye } from 'lucide-react'

import { Cliente } from '@/types/cliente.types'
import { clienteService } from '@/services/cliente.service'
import { useDebounce } from '@/hooks/useDebounce'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'

import { ClienteAvatar } from '@/components/admin/clientes/ClienteAvatar'
import { ClienteDrawer } from '@/components/admin/clientes/ClienteDrawer'
import { ClienteFiltros, FiltroCliente } from '@/components/admin/clientes/ClienteFiltros'
import {
  VipBadge, EstadoBadge, VerificadoBadge, VisitasBadge, TipoBadge,
} from '@/components/admin/clientes/ClienteBadges'

import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

/* ── Helpers de filtro ───────────────────────────────────────────────────────── */

function buildParams(filtro: FiltroCliente, page: number, size: number, search?: string) {
  return {
    page,
    size,
    search: search || undefined,
    esVip:    filtro === 'vip'        ? true  : undefined,
    activo:   filtro === 'activos'    ? true
            : filtro === 'inactivos'  ? false : undefined,
    verificado: filtro === 'verificados' ? true  : undefined,
    frecuente:  filtro === 'frecuentes'  ? true  : undefined,
  }
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function ClientesPage() {
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [filtro, setFiltro]   = useState<FiltroCliente>('todos')
  const [drawer, setDrawer]   = useState<Cliente | null>(null)

  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes', page, debouncedSearch, filtro],
    queryFn:  () =>
      clienteService.listar(buildParams(filtro, page, 15, debouncedSearch)),
  })

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(0)
  }

  const handleFiltro = (f: FiltroCliente) => {
    setFiltro(f)
    setPage(0)
  }

  /* ── Columnas ────────────────────────────────────────────────────────────── */

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'nombre',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-brand-azul transition-colors"
        >
          Cliente
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center gap-3">
            <ClienteAvatar
              nombre={c.nombre}
              fotoPerfil={c.fotoPerfil}
              esVip={c.esVip}
              size="sm"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{c.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{c.correo}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'telefono',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Telefono
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.telefono ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'tipoCliente',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tipo
        </span>
      ),
      cell: ({ row }) => <TipoBadge tipo={row.original.tipoCliente} />,
    },
    {
      accessorKey: 'esVip',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          VIP
        </span>
      ),
      cell: ({ row }) =>
        row.original.esVip
          ? <VipBadge descuento={row.original.descuentoVip} />
          : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      accessorKey: 'contadorVisitas',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-brand-azul transition-colors"
        >
          Visitas
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => <VisitasBadge visitas={row.original.contadorVisitas} />,
    },
    {
      accessorKey: 'correoVerificado',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Verif.
        </span>
      ),
      cell: ({ row }) => <VerificadoBadge verificado={row.original.correoVerificado} />,
    },
    {
      accessorKey: 'activo',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Estado
        </span>
      ),
      cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
    },
    {
      accessorKey: 'fechaCreacion',
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Registro
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{formatDate(row.original.fechaCreacion)}</span>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg gap-1.5 text-xs text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8"
          onClick={() => setDrawer(row.original)}
        >
          <Eye className="h-3.5 w-3.5" />
          Ver perfil
        </Button>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        description="Gestion de clientes registrados en el sistema"
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

      <ClienteFiltros
        search={search}
        filtro={filtro}
        total={data?.totalElements}
        onSearchChange={handleSearch}
        onFiltroChange={handleFiltro}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron clientes con los filtros aplicados."
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

      <ClienteDrawer cliente={drawer} onClose={() => setDrawer(null)} />
    </div>
  )
}