'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  pageActual: number
  totalPaginas: number
  onPageChange: (page: number) => void
}

export function PaginacionUsuarios({ pageActual, totalPaginas, onPageChange }: Props) {
  if (totalPaginas <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pageActual <= 1}
        onClick={() => onPageChange(pageActual - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[72px] text-center text-xs text-muted-foreground">
        {pageActual} de {totalPaginas}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pageActual >= totalPaginas}
        onClick={() => onPageChange(pageActual + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
