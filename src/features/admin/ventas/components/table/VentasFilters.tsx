import React from 'react'
import { Search, X, CalendarRange } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface VentasFiltersProps {
  search: string
  desde: string
  hasta: string
  tipo: string
  onSearchChange: (val: string) => void
  onDesdeChange: (val: string) => void
  onHastaChange: (val: string) => void
  onTipoChange: (val: string) => void
}

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'RESERVA', label: 'Entradas' },
  { value: 'ADELANTO_EVENTO', label: 'Evento privado' },
]

const DEFAULT_DESDE = format(startOfMonth(new Date()), 'yyyy-MM-dd')
const DEFAULT_HASTA = format(endOfMonth(new Date()), 'yyyy-MM-dd')

export const VentasFilters = ({
  search,
  desde,
  hasta,
  tipo,
  onSearchChange,
  onDesdeChange,
  onHastaChange,
  onTipoChange,
}: VentasFiltersProps) => {
  const rangoInvalido = desde && hasta && desde > hasta

  const tieneFiltros =
    !!search || !!tipo || desde !== DEFAULT_DESDE || hasta !== DEFAULT_HASTA

  const limpiar = () => {
    onSearchChange('')
    onTipoChange('')
    onDesdeChange(DEFAULT_DESDE)
    onHastaChange(DEFAULT_HASTA)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, acompañante o N° venta…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9"
          />
        </div>

        <Select
          value={tipo || '__all__'}
          onValueChange={(v) => onTipoChange(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-full sm:w-44 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem
                key={t.value || '__all__'}
                value={t.value || '__all__'}
              >
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CalendarRange className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              type="date"
              value={desde}
              onChange={(e) => onDesdeChange(e.target.value)}
              className={cn(
                'flex-1 min-w-0 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm',
                rangoInvalido &&
                  'border-red-400 dark:border-red-600 focus-visible:ring-red-400'
              )}
            />
            <span className="text-xs text-gray-400 shrink-0">al</span>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => onHastaChange(e.target.value)}
              className={cn(
                'flex-1 min-w-0 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm',
                rangoInvalido &&
                  'border-red-400 dark:border-red-600 focus-visible:ring-red-400'
              )}
            />
          </div>
        </div>

        {tieneFiltros && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limpiar}
            className="h-9 px-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 gap-1.5 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {rangoInvalido && (
        <p className="text-xs font-medium text-red-500 dark:text-red-400">
          La fecha inicial no puede ser posterior a la fecha final.
        </p>
      )}
    </div>
  )
}
