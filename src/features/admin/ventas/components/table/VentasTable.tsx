import React from 'react'
import { Eye, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { VentaResumen } from '../../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TipoVentaBadge } from '../shared/TipoVentaBadge'
import { EstadoVentaBadge } from '../shared/EstadoVentaBadge'
import { PageableResponse } from '@/features/admin/reservas/types'

interface VentasTableProps {
  data?: PageableResponse<VentaResumen>
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  onViewVenta: (id: string) => void
}

export const VentasTable = ({
  data,
  page,
  size,
  onPageChange,
  onSizeChange,
  onViewVenta,
}: VentasTableProps) => {
  const router = useRouter()

  if (!data?.content?.length) {
    return (
      <Card className="border-none shadow-sm flex flex-col items-center justify-center py-20 bg-white">
        <p className="text-gray-500 font-medium">No se encontraron ventas para esta consulta.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-500">ID Venta</TableHead>
                <TableHead className="font-semibold text-gray-500">Fecha Operación</TableHead>
                <TableHead className="font-semibold text-gray-500">Cliente / Acompañante</TableHead>
                <TableHead className="font-semibold text-gray-500">Canal</TableHead>
                <TableHead className="font-semibold text-gray-500">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-500 text-right">Total</TableHead>
                <TableHead className="font-semibold text-gray-500 text-center">Estado</TableHead>
                <TableHead className="font-semibold text-gray-500 text-center w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((v) => (
                <TableRow key={v.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs font-medium text-brand-azul">
                    V-{v.id.toString().padStart(5, '0')}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(v.createdAt, "d MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {v.nombreCliente ? (
                      <span className="text-brand-azul font-semibold">{v.nombreCliente}</span>
                    ) : v.nombreAcompanante ? (
                      <span>{v.nombreAcompanante} <span className="text-xs text-gray-400 font-normal">(Acompañante)</span></span>
                    ) : (
                      <span className="text-gray-400 italic">Cliente mostrador</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <span className="capitalize">
                      {v.canalCodigo === 'MOSTRADOR' 
                        ? 'Caja (Presencial)' 
                        : v.canalCodigo === 'WEB' 
                          ? 'Tienda Online' 
                          : v.canalCodigo?.toLowerCase().replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TipoVentaBadge tipo={v.tipo} />
                  </TableCell>
                  <TableCell className="text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(v.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    <EstadoVentaBadge total={v.total} pagado={v.totalPagado !== undefined ? v.totalPagado : v.total} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        title="Ver Detalle"
                        onClick={() => onViewVenta(v.id.toString())}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        title="Ver en Reservas"
                        onClick={() => {
                          const filterVal = v.nombreCliente || v.nombreAcompanante || `V-${v.id}`;
                          router.push(`/admin/reservas?search=${encodeURIComponent(filterVal)}`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Mostrando {data.content.length} de {data.totalElements} ventas
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= data.totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
