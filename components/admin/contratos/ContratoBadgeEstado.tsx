import { Badge } from '@/components/ui/Badge'
import { EstadoContrato } from '@/types/contrato.types'
import { cn } from '@/lib/utils'

const CONFIG: Record<EstadoContrato, { label: string; cls: string }> = {
  BORRADOR:       { label: 'Borrador',        cls: 'bg-gray-100 text-gray-600 border-gray-200'            },
  ENVIADO:        { label: 'Enviado',          cls: 'bg-blue-100 text-blue-700 border-blue-200'            },
  PENDIENTE_FIRMA:{ label: 'Pend. de firma',  cls: 'bg-amber-100 text-amber-800 border-amber-200'         },
  FIRMADO:        { label: 'Firmado',          cls: 'bg-green-100 text-green-800 border-green-200'         },
  VENCIDO:        { label: 'Vencido',          cls: 'bg-orange-100 text-orange-700 border-orange-200'      },
  CANCELADO:      { label: 'Cancelado',        cls: 'bg-red-100 text-red-700 border-red-200'               },
  ARCHIVADO:      { label: 'Archivado',        cls: 'bg-slate-100 text-slate-600 border-slate-200'         },
}

interface ContratoBadgeEstadoProps {
  estado: EstadoContrato | string
  size?:  'sm' | 'md'
}

export function ContratoBadgeEstado({ estado, size = 'md' }: ContratoBadgeEstadoProps) {
  const cfg = CONFIG[estado as EstadoContrato] ?? { label: estado, cls: 'bg-gray-100 text-gray-600' }
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold border',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        cfg.cls,
      )}
    >
      {cfg.label}
    </Badge>
  )
}