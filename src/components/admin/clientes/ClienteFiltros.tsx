// components/admin/clientes/ClienteFiltros.tsx

'use client'

import { Search, Crown, UserCheck, UserX, Mail, Star, X, Globe, MapPin, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export type FiltroCliente =
  | 'todos'
  | 'vip'
  | 'activos'
  | 'inactivos'
  | 'verificados'
  | 'frecuentes'
  | 'web'
  | 'presenciales'
  | 'admin'
  | 'nuevos'
  | 'inactivos_seg'

interface FiltroBtn {
  key: FiltroCliente
  label: string
  icon: React.ElementType
  activeClass: string
}

const FILTROS: FiltroBtn[] = [
  { key: 'todos',        label: 'Todos',        icon: UserCheck,    activeClass: 'bg-gray-900 text-white border-gray-900' },
  { key: 'vip',         label: 'VIP',           icon: Crown,        activeClass: 'bg-brand-amarillo/20 text-yellow-800 border-brand-amarillo/40' },
  { key: 'activos',     label: 'Activos',       icon: UserCheck,    activeClass: 'bg-green-100 text-green-800 border-green-200' },
  { key: 'inactivos',   label: 'Inactivos',     icon: UserX,        activeClass: 'bg-red-50 text-red-700 border-red-200' },
  { key: 'verificados', label: 'Verificados',   icon: Mail,         activeClass: 'bg-brand-azul/10 text-brand-azul border-brand-azul/30' },
  { key: 'frecuentes',  label: 'Frecuentes',    icon: Star,         activeClass: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/30' },
  { key: 'web',         label: 'Web',           icon: Globe,        activeClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  { key: 'presenciales',label: 'Presenciales',  icon: MapPin,       activeClass: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'admin',       label: 'Registrados',   icon: ShieldCheck,  activeClass: 'bg-purple-100 text-purple-700 border-purple-200' },
]

interface ClienteFiltrosProps {
  search: string
  filtro: FiltroCliente
  total?: number
  onSearchChange: (v: string) => void
  onFiltroChange: (f: FiltroCliente) => void
}

export function ClienteFiltros({
  search,
  filtro,
  total,
  onSearchChange,
  onFiltroChange,
}: ClienteFiltrosProps) {
  return (
    <div className="space-y-3">
      {/* Barra de busqueda */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, correo, DNI o telefono..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-xl border-gray-200 bg-white"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {total !== undefined && (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 border-gray-200 font-semibold"
          >
            {total} cliente{total !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTROS.map(({ key, label, icon: Icon, activeClass }) => (
          <button
            key={key}
            onClick={() => onFiltroChange(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 h-8 rounded-full border text-xs font-semibold transition-all',
              filtro === key
                ? activeClass
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
