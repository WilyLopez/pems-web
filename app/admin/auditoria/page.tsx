'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { useAuditoria } from '@/hooks/useAuditoria'
import { AuditoriaFiltrosPanel } from '@/components/admin/auditoria/AuditoriaFiltros'
import { LogDetalleModal } from '@/components/admin/auditoria/LogDetalleModal'
import { AccionBadge } from '@/components/admin/auditoria/AccionBadge'
import { NivelBadge } from '@/components/admin/auditoria/NivelBadge'
import { AuditoriaFiltros, LogAuditoria } from '@/types/auditoria.types'
import { formatDateTime } from '@/lib/utils'

function defaultFiltros(): AuditoriaFiltros {
  const hoy = new Date()
  const hace7 = new Date(); hace7.setDate(hoy.getDate() - 7)
  return {
    desde: hace7.toISOString().split('T')[0],
    hasta: hoy.toISOString().split('T')[0],
  }
}

export default function AuditoriaPage() {
  const [filtros, setFiltros]                 = useState<AuditoriaFiltros>(defaultFiltros)
  const [filtrosAplicados, setFiltrosAplicados] = useState<AuditoriaFiltros>(defaultFiltros)
  const [page, setPage]                       = useState(0)
  const [logSeleccionado, setLogSeleccionado] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useAuditoria(filtrosAplicados, page)

  function aplicarFiltros() {
    setPage(0)
    setFiltrosAplicados({ ...filtros })
  }

  const columns: ColumnDef<LogAuditoria>[] = [
    {
      accessorKey: 'fechaLog',
      header: 'Fecha y hora',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{formatDateTime(row.original.fechaLog)}</span>
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
    },
    {
      accessorKey: 'entidadAfectada',
      header: 'Entidad',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.entidadAfectada}
          {row.original.idEntidad && (
            <span className="text-muted-foreground"> #{row.original.idEntidad}</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'nombreUsuario',
      header: 'Usuario',
      cell: ({ row }) => row.original.nombreUsuario ?? '—',
    },
    {
      accessorKey: 'resultado',
      header: 'Resultado',
      cell: ({ row }) => {
        const r = row.original.resultado
        const cls = r === 'EXITOSO'  ? 'text-green-700 bg-green-50' :
                    r === 'FALLIDO'  ? 'text-red-700 bg-red-50'     :
                                       'text-orange-700 bg-orange-50'
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{r}</span>
      },
    },
    {
      accessorKey: 'ipOrigen',
      header: 'IP',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">{row.original.ipOrigen ?? '—'}</span>
      ),
    },
    {
      id: 'detalle',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setLogSeleccionado(row.original.id)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Auditoría"
        description="Registro de actividad y cambios en el sistema"
      />

      <AuditoriaFiltrosPanel
        filtros={filtros}
        onChange={setFiltros}
        onBuscar={aplicarFiltros}
      />

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
          onPageChange={setPage}
        />
      )}

      <LogDetalleModal
        logId={logSeleccionado}
        onClose={() => setLogSeleccionado(null)}
      />
    </div>
  )
}
