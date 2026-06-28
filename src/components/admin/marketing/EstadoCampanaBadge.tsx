import { Badge } from '@/components/ui/Badge'
import { EstadoCampana } from '@/types/marketing.types'
import { cn } from '@/lib/utils'

const CONFIG: Record<EstadoCampana, { label: string; cls: string }> = {
  BORRADOR: {
    label: 'Borrador',
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  PROGRAMADA: {
    label: 'Programada',
    cls: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  ENVIANDO: {
    label: 'Enviando',
    cls: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  FINALIZADA: {
    label: 'Finalizada',
    cls: 'bg-green-100 text-green-700 border-green-200',
  },
  CANCELADA: {
    label: 'Cancelada',
    cls: 'bg-red-100 text-red-600 border-red-200',
  },
}

export function EstadoCampanaBadge({ estado }: { estado: EstadoCampana }) {
  const cfg = CONFIG[estado] ?? CONFIG.BORRADOR
  return (
    <Badge variant="outline" className={cn('text-xs font-semibold', cfg.cls)}>
      {cfg.label}
    </Badge>
  )
}
