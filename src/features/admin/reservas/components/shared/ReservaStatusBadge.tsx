import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { EstadoReserva } from '../../types'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface ReservaStatusBadgeProps {
  estado: EstadoReserva
  ingresado?: boolean
  esReprogramacion?: boolean
}

const ESTADO_CONFIG: Record<EstadoReserva, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  REPROGRAMADA: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETADA: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELADA: 'bg-red-100 text-red-700 border-red-200',
}

export const ReservaStatusBadge = React.memo(({ estado, ingresado, esReprogramacion }: ReservaStatusBadgeProps) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge
        variant="outline"
        className={cn('text-[10px] font-bold', ESTADO_CONFIG[estado])}
      >
        {estado}
      </Badge>
      
      {esReprogramacion && estado !== 'REPROGRAMADA' && (
        <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200 uppercase tracking-tighter px-1 h-4">
          Reprog.
        </Badge>
      )}

      {ingresado && (
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
        </span>
      )}
    </div>
  )
})

ReservaStatusBadge.displayName = 'ReservaStatusBadge'
