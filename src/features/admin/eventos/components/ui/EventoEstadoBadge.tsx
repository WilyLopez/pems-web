import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { EstadoEvento } from '../../types'

const CONFIG: Record<EstadoEvento, { label: string; className: string }> = {
  SOLICITADA: {
    label: 'Solicitada',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  CONFIRMADA: {
    label: 'Confirmada',
    className:
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  COMPLETADA: {
    label: 'Completada',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  CANCELADA: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
}

interface EventoEstadoBadgeProps {
  estado: EstadoEvento
  size?: 'sm' | 'default'
  className?: string
}

export function EventoEstadoBadge({
  estado,
  size = 'default',
  className,
}: EventoEstadoBadgeProps) {
  const config = CONFIG[estado] ?? {
    label: estado,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-bold',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
