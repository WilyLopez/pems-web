'use client'

import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page, totalPages, totalElements, size, onPageChange,
}: DataTablePaginationProps) {
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 mt-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {totalElements} registros
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(0)} disabled={page === 0}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-3 py-1 rounded-md border bg-muted min-w-[4rem] text-center">
          {page + 1} / {totalPages}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}