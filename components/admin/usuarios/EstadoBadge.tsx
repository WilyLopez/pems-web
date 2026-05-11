import { Badge } from '@/components/ui/Badge'
import { EstadoAdmin } from '@/types/usuario-admin.types'
import { cn } from '@/lib/utils'

const STYLES: Record<EstadoAdmin, string> = {
  ACTIVO:   'bg-green-100 text-green-800',
  INACTIVO: 'bg-yellow-100 text-yellow-800',
  BLOQUEADO:'bg-red-100 text-red-800',
}

const LABELS: Record<EstadoAdmin, string> = {
  ACTIVO:   'Activo',
  INACTIVO: 'Inactivo',
  BLOQUEADO:'Bloqueado',
}

export function EstadoBadge({ estado }: { estado: EstadoAdmin }) {
  return (
    <Badge variant="secondary" className={cn('font-medium', STYLES[estado])}>
      {LABELS[estado]}
    </Badge>
  )
}
