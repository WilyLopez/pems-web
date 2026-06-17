import React, { useState, useEffect } from 'react'
import { Search, X, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'REPROGRAMADA', label: 'Reprogramada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

interface ReservasFiltersProps {
  search: string
  estado: string
  fecha: string
  ingresado?: boolean
  onSearchChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onFechaChange: (value: string) => void
  onIngresadoChange: (value?: boolean) => void
}

export const ReservasFilters = React.memo(({
  search,
  estado,
  fecha,
  ingresado,
  onSearchChange,
  onEstadoChange,
  onFechaChange,
  onIngresadoChange,
}: ReservasFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const handleSearchSubmit = () => {
    onSearchChange(localSearch)
  }

  const handleSearchClear = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-48 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Ticket, niño, acompañante..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          className="pl-9 h-10 rounded-xl border-gray-200"
        />
        {localSearch && (
          <button
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Input
        type="date"
        value={fecha}
        onChange={(e) => onFechaChange(e.target.value)}
        className="h-10 rounded-xl border-gray-200 w-44"
      />

      <Select value={estado || 'todos'} onValueChange={(v) => onEstadoChange(v === 'todos' ? '' : v)}>
        <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 text-sm">
          <SelectValue placeholder="Estado..." />
        </SelectTrigger>
        <SelectContent>
          {ESTADOS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        {(
          [
            { value: undefined, label: 'Todos' },
            { value: false, label: 'Sin Ingreso' },
            { value: true, label: 'Ingresados' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={String(value)}
            onClick={() => onIngresadoChange(value)}
            className={cn(
              'px-3 h-10 rounded-xl text-xs font-semibold border transition-all',
              ingresado === value
                ? 'bg-brand-azul text-white border-brand-azul'
                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-azul/40'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
})

ReservasFilters.displayName = 'ReservasFilters'
