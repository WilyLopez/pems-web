import React from 'react'
import { Eye } from 'lucide-react'
import { VentaResumen } from '../../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TipoVentaBadge } from '../shared/TipoVentaBadge'
import { EstadoVentaBadge } from '../shared/EstadoVentaBadge'
import { CanalBadge } from '../shared/CanalBadge'
import { PaginacionControles } from '../shared/PaginacionControles'
import { PageableResponse } from '@/features/admin/reservas/types'

interface VentasTableProps {
  data?: PageableResponse<VentaResumen>
  isLoading?: boolean
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  onViewVenta: (id: string) => void
}

function TableSkeleton() {
  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow>
              {['ID', 'Operación', 'Visita', 'Cliente', 'Canal / Tipo', 'Total', 'Estado', ''].map((h) => (
                <TableHead key={h} className="text-xs font-semibold text-gray-400 dark:text-gray-500">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-gray-100 dark:border-gray-800">
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export const VentasTable = ({
  data,
  isLoading,
  page,
  size,
  onPageChange,
  onSizeChange,
  onViewVenta,
}: VentasTableProps) => {
  if (isLoading) return <TableSkeleton />

  if (!data?.content?.length) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          No se encontraron ventas para esta consulta.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Registro</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Visita</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cliente / Acompañante</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Canal / Tipo</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Total</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Estado</TableHead>
                <TableHead className="w-[52px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((v) => (
                <TableRow
                  key={v.id}
                  className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 cursor-pointer group"
                  onClick={() => onViewVenta(v.id.toString())}
                >
                  <TableCell className="font-mono text-xs font-bold text-brand-azul dark:text-brand-azul/80 whitespace-nowrap">
                    V-{v.id.toString().padStart(5, '0')}
                  </TableCell>

                  <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(v.createdAt, 'd MMM yyyy')}
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500">
                      {formatDate(v.createdAt, 'HH:mm')}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {v.fechaVisita ? (
                      formatDate(v.fechaVisita, 'd MMM yyyy')
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[180px]">
                    {v.nombreCliente ? (
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{v.nombreCliente}</p>
                    ) : v.nombreAcompanante ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{v.nombreAcompanante}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Acompañante</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">Mostrador</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <CanalBadge canal={v.canalCodigo} />
                      <TipoVentaBadge tipo={v.tipo} />
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                      {formatCurrency(v.total)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <EstadoVentaBadge total={v.total} pagado={v.totalPagado} />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Ver detalle"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewVenta(v.id.toString())
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <PaginacionControles
        page={page}
        size={size}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
    </div>
  )
}
