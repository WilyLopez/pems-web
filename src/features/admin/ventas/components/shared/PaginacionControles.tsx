import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'

interface PaginacionControlesProps {
  page: number
  size: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

const TAMANIOS = [10, 20, 50]
const MAX_BOTONES = 5

function buildPages(current: number, total: number): (number | '...')[] {
  if (total === 0) return []
  if (total <= MAX_BOTONES + 2) {
    return Array.from({ length: total }, (_, i) => i)
  }

  const pages: (number | '...')[] = []
  const half = Math.floor(MAX_BOTONES / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(total - 2, current + half)

  if (current - half < 1) end = Math.min(total - 2, MAX_BOTONES)
  if (current + half > total - 2) start = Math.max(1, total - 1 - MAX_BOTONES)

  pages.push(0)
  if (start > 1) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 2) pages.push('...')
  pages.push(total - 1)

  return pages
}

export const PaginacionControles = ({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
}: PaginacionControlesProps) => {
  const desde = totalElements === 0 ? 0 : page * size + 1
  const hasta = Math.min(page * size + size, totalElements)

  const pages = buildPages(page, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
        Mostrando{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {desde}–{hasta}
        </span>{' '}
        de{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-200">{totalElements}</span>{' '}
        registros
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Por página</span>
          <Select
            value={size.toString()}
            onValueChange={(v) => onSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[68px] text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAMANIOS.map((t) => (
                <SelectItem key={t} value={t.toString()} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-gray-400 dark:text-gray-500 select-none">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant="outline"
                size="icon"
                className={cn(
                  'h-8 w-8 text-xs font-semibold border-gray-200 dark:border-gray-700',
                  p === page
                    ? 'bg-brand-azul text-white border-brand-azul hover:bg-brand-azul/90'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300',
                )}
                onClick={() => onPageChange(p as number)}
              >
                {(p as number) + 1}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
