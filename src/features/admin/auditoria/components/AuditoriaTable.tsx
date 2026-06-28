'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'
import { LogAuditoria, AuditoriaPage } from '../types'
import { AccionBadge } from './AccionBadge'
import { NivelBadge } from './NivelBadge'
import { ResultadoBadge } from './ResultadoBadge'

interface Props {
  data?: AuditoriaPage
  isLoading: boolean
  onVerDetalle: (id: number) => void
  onPageChange: (page: number) => void
}

export function AuditoriaTable({
  data,
  isLoading,
  onVerDetalle,
  onPageChange,
}: Props) {
  const columns: ColumnDef<LogAuditoria>[] = [
    {
      accessorKey: 'fechaLog',
      header: 'Fecha y hora',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDateTime(row.original.fechaLog)}
        </span>
      ),
    },
    {
      accessorKey: 'accion',
      header: 'Acción',
      cell: ({ row }) => <AccionBadge accion={row.original.accion} />,
    },
    {
      accessorKey: 'nivel',
      header: 'Nivel',
      cell: ({ row }) => <NivelBadge nivel={row.original.nivel} />,
    },
    {
      accessorKey: 'modulo',
      header: 'Módulo',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.original.modulo}
        </span>
      ),
    },
    {
      accessorKey: 'entidadAfectada',
      header: 'Entidad',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.entidadAfectada}
          {row.original.idEntidad && (
            <span className="text-muted-foreground">
              {' '}
              #{row.original.idEntidad}
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'nombreUsuario',
      header: 'Usuario',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.nombreUsuario ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'resultado',
      header: 'Resultado',
      cell: ({ row }) => <ResultadoBadge resultado={row.original.resultado} />,
    },
    {
      accessorKey: 'ipOrigen',
      header: 'IP',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.ipOrigen ?? '—'}
        </span>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onVerDetalle(row.original.id)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage="No hay registros en el rango seleccionado."
      />
      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
