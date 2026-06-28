'use client'

import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [15, 25, 50],
}: DataTablePaginationProps) {
  const from = totalElements === 0 ? 0 : page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 mt-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {totalElements === 0
            ? 'Sin resultados'
            : `Mostrando ${from}–${to} de ${totalElements} registros`}
        </p>
        {onSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Por página:</span>
            <Select
              value={String(size)}
              onValueChange={(v) => {
                onSizeChange(Number(v))
                onPageChange(0)
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(0)}
          disabled={page === 0}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-3 py-1 rounded-md border bg-muted min-w-[4rem] text-center">
          {totalPages === 0 ? '0 / 0' : `${page + 1} / ${totalPages}`}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
