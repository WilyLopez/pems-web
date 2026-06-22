import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface VentasFiltersProps {
  search: string
  desde: string
  hasta: string
  onSearchChange: (val: string) => void
  onDesdeChange: (val: string) => void
  onHastaChange: (val: string) => void
}

export const VentasFilters = ({
  search,
  desde,
  hasta,
  onSearchChange,
  onDesdeChange,
  onHastaChange,
}: VentasFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por cliente o nro venta..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={desde}
          onChange={(e) => onDesdeChange(e.target.value)}
          className="bg-white w-40"
        />
        <span className="text-sm text-gray-400">al</span>
        <Input
          type="date"
          value={hasta}
          onChange={(e) => onHastaChange(e.target.value)}
          className="bg-white w-40"
        />
      </div>
    </div>
  )
}
