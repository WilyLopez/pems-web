'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react'

import { EventoPrivado } from '@/types/evento.types'
import { useEventos, useConfirmarEvento, useCancelarEvento } from '@/hooks/useEventos'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { StatusBadge } from '@/components/common/Statusbadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { formatDate, formatCurrency } from '@/lib/utils'

const ESTADOS_EVENTO = ['SOLICITADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

type DialogType = 'confirmar' | 'cancelar' | null

export default function EventosPage() {
  const { idSede } = useAuth()
  const [page, setPage] = useState(0)
  const [estado, setEstado] = useState('')
  const [dialog, setDialog] = useState<{ type: DialogType; evento: EventoPrivado | null }>({
    type: null, evento: null,
  })

  const { data, isLoading, isError, refetch } = useEventos({
    page, size: 15, estado: estado || undefined, idSede: idSede ?? undefined,
  })

  const confirmar = useConfirmarEvento()
  const cancelar = useCancelarEvento()

  const closeDialog = () => setDialog({ type: null, evento: null })

  const columns: ColumnDef<EventoPrivado>[] = [
    {
      accessorKey: 'fechaEvento',
      header: 'Fecha',
      cell: ({ row }) => formatDate(row.original.fechaEvento),
    },
    {
      accessorKey: 'nombreCliente',
      header: 'Cliente',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.nombreCliente}</p>
          <p className="text-xs text-muted-foreground">{row.original.correoCliente}</p>
        </div>
      ),
    },
    {
      accessorKey: 'turno',
      header: 'Turno',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.turno}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.horaInicio} – {row.original.horaFin}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'tipoEvento',
      header: 'Tipo de evento',
    },
    {
      accessorKey: 'precioTotalContrato',
      header: 'Monto',
      cell: ({ row }) =>
        row.original.precioTotalContrato
          ? formatCurrency(row.original.precioTotalContrato)
          : '—',
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
        const e = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={e.estado !== 'SOLICITADA'}
                onClick={() => setDialog({ type: 'confirmar', evento: e })}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Confirmar evento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={['COMPLETADA', 'CANCELADA'].includes(e.estado)}
                onClick={() => setDialog({ type: 'cancelar', evento: e })}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar evento
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
        title="Eventos Privados"
        description="Solicitudes y eventos privados del local"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente o tipo..." className="pl-9" />
        </div>
        <Select value={estado} onValueChange={(v) => { setEstado(v === 'TODOS' ? '' : v); setPage(0) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            {ESTADOS_EVENTO.map((e) => (
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
        emptyMessage="No se encontraron eventos con los filtros seleccionados."
      />

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page} totalPages={data.totalPages}
          totalElements={data.totalElements} size={data.size}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={dialog.type === 'confirmar'}
        onOpenChange={(o) => !o && closeDialog()}
        title="¿Confirmar evento?"
        description={`Se confirmará el evento del ${dialog.evento ? formatDate(dialog.evento.fechaEvento) : ''}. Se notificará al cliente por correo.`}
        confirmLabel="Confirmar"
        loading={confirmar.isPending}
        onConfirm={() => {
          if (dialog.evento) {
            confirmar.mutate(
              { id: dialog.evento.id, precioTotal: dialog.evento.precioTotalContrato ?? 0 },
              { onSettled: closeDialog }
            )
          }
        }}
      />

      <ConfirmDialog
        open={dialog.type === 'cancelar'}
        onOpenChange={(o) => !o && closeDialog()}
        title="¿Cancelar evento?"
        description="Se cancelará el evento y se notificará al cliente. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        destructive
        loading={cancelar.isPending}
        onConfirm={() => {
          if (dialog.evento) {
            cancelar.mutate(
              { id: dialog.evento.id, motivo: 'Cancelado por administrador' },
              { onSettled: closeDialog }
            )
          }
        }}
      />
    </div>
  )
}