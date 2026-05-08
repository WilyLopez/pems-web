'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Ban, RefreshCw, Search } from 'lucide-react'
import { Metadata } from 'next'

import { Reserva } from '@/types/reserva.types'
import { useReservas, useCancelarReserva } from '@/hooks/useReservas'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { StatusBadge } from '@/components/common/Statusbadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { formatDate, formatCurrency } from '@/lib/utils'

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA', 'COMPLETADA', 'CANCELADA']

export default function ReservasPage() {
  const { idSede } = useAuth()
  const [page, setPage] = useState(0)
  const [estado, setEstado] = useState<string>('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const [cancelTarget, setCancelTarget] = useState<Reserva | null>(null)

  const { data, isLoading, isError, refetch } = useReservas({
    page, size: 15, estado: estado || undefined, idSede: idSede ?? undefined,
  })

  const cancelar = useCancelarReserva()

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: 'numeroTicket',
      header: 'Ticket',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.numeroTicket}</span>
      ),
    },
    {
      accessorKey: 'fechaEvento',
      header: 'Fecha',
      cell: ({ row }) => formatDate(row.original.fechaEvento),
    },
    {
      accessorKey: 'nombreNino',
      header: 'Niño',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.nombreNino}</p>
          <p className="text-xs text-muted-foreground">{row.original.edadNino} años</p>
        </div>
      ),
    },
    {
      accessorKey: 'nombreAcompanante',
      header: 'Acompañante',
    },
    {
      accessorKey: 'totalPagado',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.original.totalPagado),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const r = row.original
        const cancelable = ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={!cancelable}
                onClick={() => setCancelTarget(r)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reservas"
        description="Gestión de reservas públicas de acceso al local"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket o nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
        <Select value={estado} onValueChange={(v) => { setEstado(v === 'TODOS' ? '' : v); setPage(0) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage="No se encontraron reservas con los filtros seleccionados."
      />

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="¿Cancelar reserva?"
        description={`Se cancelará el ticket ${cancelTarget?.numeroTicket}. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar"
        destructive
        loading={cancelar.isPending}
        onConfirm={() => {
          if (cancelTarget) {
            cancelar.mutate(
              { id: cancelTarget.id, motivo: 'Cancelación solicitada por administrador' },
              { onSettled: () => setCancelTarget(null) }
            )
          }
        }}
      />
    </div>
  )
}