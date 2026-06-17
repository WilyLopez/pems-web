'use client'

import React, { useMemo } from 'react'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { Reserva, PageableResponse } from '../../types'
import { getColumns } from './columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface ReservasTableProps {
  data?: PageableResponse<Reserva>
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  onViewReserva: (id: number) => void
  onActionReserva: (action: string, id: number) => void
}

export const ReservasTable = React.memo(({
  data,
  page,
  size,
  onPageChange,
  onSizeChange,
  onViewReserva,
  onActionReserva,
}: ReservasTableProps) => {
  const columns = useMemo(
    () => getColumns({ onView: onViewReserva, onAction: onActionReserva }),
    [onViewReserva, onActionReserva]
  )

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <DataTable columns={columns} data={data?.content ?? []} />
      {data?.totalElements !== undefined && (
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filas por página:</span>
            <Select
              value={size.toString()}
              onValueChange={(v) => onSizeChange(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-white">
                <SelectValue placeholder={size} />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20].map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTablePagination
            page={page}
            size={size}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
})

ReservasTable.displayName = 'ReservasTable'
