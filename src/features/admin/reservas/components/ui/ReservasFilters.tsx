import React, { useState, useEffect } from 'react'
import { Search, X, XCircle } from 'lucide-react'
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
  medioPago?: string
  yapePendienteCount?: number
  onSearchChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onFechaChange: (value: string) => void
  onIngresadoChange: (value?: boolean) => void
  onMedioPagoChange: (value: string) => void
  onToggleYapePendiente: (activo: boolean) => void
  onClearFilters: () => void
}

export const ReservasFilters = React.memo(
  ({
    search,
    estado,
    fecha,
    ingresado,
    medioPago,
    yapePendienteCount = 0,
    onSearchChange,
    onEstadoChange,
    onFechaChange,
    onIngresadoChange,
    onMedioPagoChange,
    onToggleYapePendiente,
    onClearFilters,
  }: ReservasFiltersProps) => {

    const [localSearch, setLocalSearch] = useState(search)

    useEffect(() => {
      setLocalSearch(search)
    }, [search])

    useEffect(() => {
      const timer = setTimeout(() => {
        if (localSearch !== search) {
          onSearchChange(localSearch)
        }
      }, 300)
      return () => clearTimeout(timer)
    }, [localSearch, search, onSearchChange])


    const handleSearchClear = () => {
      setLocalSearch('')
      onSearchChange('')
    }

    const yapePendienteActivo = medioPago === 'YAPE' && estado === 'PENDIENTE'

    const toggleYapePendiente = () => {
      onToggleYapePendiente(!yapePendienteActivo)
    }


    return (
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 flex-wrap lg:flex-nowrap items-center w-full">
          <div className="relative w-full lg:flex-1 min-w-[200px] lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar ticket, niño..."

              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-9 h-10 rounded-2xl border-gray-200 focus-visible:ring-brand-azul transition-all w-full"
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
            className="h-10 rounded-2xl border-gray-200 w-full sm:w-44 lg:w-40 focus-visible:ring-brand-azul transition-all"
          />

          <Select
            value={estado || 'todos'}
            onValueChange={(v) => onEstadoChange(v === 'todos' ? '' : v)}
          >
            <SelectTrigger className="h-10 w-full sm:w-44 lg:w-40 rounded-2xl border-gray-200 text-sm focus-visible:ring-brand-azul transition-all">
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {ESTADOS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="rounded-xl">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-gray-100/60 p-1 rounded-2xl border border-gray-100 w-full sm:w-auto shrink-0">
            {(
              [
                { value: undefined, label: 'Todos' },
                { value: false, label: 'Sin Ingreso' },
                { value: true, label: 'Ingresados' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => onIngresadoChange(value)}
                className={cn(
                  'flex-1 sm:flex-none px-3 h-8 rounded-xl text-xs font-bold transition-all duration-200',
                  ingresado === value
                    ? 'bg-brand-azul text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleYapePendiente}
            className={cn(
              'flex items-center justify-center gap-2 px-4 h-10 rounded-2xl text-xs font-bold transition-all duration-200 border w-full sm:w-auto shrink-0',
              yapePendienteActivo
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
            )}
          >
            <span>Yape por validar</span>
            {yapePendienteCount > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-black',
                  yapePendienteActivo
                    ? 'bg-white text-amber-600'
                    : 'bg-amber-500 text-white'
                )}
              >
                {yapePendienteCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-2xl text-xs font-bold transition-all duration-200 border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full sm:w-auto shrink-0"
            title="Limpiar todos los filtros"
          >
            <XCircle className="h-4 w-4 text-gray-400" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

    )

  }
)

ReservasFilters.displayName = 'ReservasFilters'
