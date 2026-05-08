'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'

interface LogAuditoria {
  id: number
  idUsuarioAdmin?: number
  nombreUsuario?: string
  accion: string
  modulo: string
  entidadAfectada: string
  idEntidad?: number
  descripcion?: string
  ipOrigen?: string
  timestamp: string
}

const COLORES_ACCION: Record<string, string> = {
  CREAR: 'bg-green-100 text-green-800',
  ACTUALIZAR: 'bg-blue-100 text-blue-800',
  ELIMINAR: 'bg-red-100 text-red-800',
  CONSULTAR: 'bg-gray-100 text-gray-700',
}

export default function AuditoriaPage() {
  const [page, setPage] = useState(0)
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditoria', page, desde, hasta],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PagedResponse<LogAuditoria>>>('/auditoria', {
        params: { desde: `${desde}T00:00:00`, hasta: `${hasta}T23:59:59`, pagina: page, tamano: 20 },
      })
      return data.data
    },
  })

  const columns: ColumnDef<LogAuditoria>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Fecha y hora',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{formatDateTime(row.original.timestamp)}</span>
      ),
    },
    {
      accessorKey: 'accion',
      header: 'Acción',
      cell: ({ row }) => (
        <Badge variant="secondary" className={COLORES_ACCION[row.original.accion] ?? 'bg-gray-100 text-gray-700'}>
          {row.original.accion}
        </Badge>
      ),
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
      cell: ({ row }) => row.original.nombreUsuario ?? '---',
    },
    {
      accessorKey: 'ipOrigen',
      header: 'IP',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">{row.original.ipOrigen ?? '---'}</span>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader title="Auditoría" description="Registro de actividad y cambios en el sistema" />

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(0) }} className="w-36 h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(0) }} className="w-36 h-9" />
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <Search className="mr-2 h-4 w-4" />
          Consultar
        </Button>
      </div>

      <DataTable columns={columns} data={data?.content ?? []} isLoading={isLoading} emptyMessage="No hay registros en el rango seleccionado." />

      {data && data.totalPages > 1 && (
        <DataTablePagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPageChange={setPage} />
      )}
    </div>
  )
}