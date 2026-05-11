import { Badge } from '@/components/ui/Badge'
import { NivelAuditoria } from '@/types/auditoria.types'
import { cn } from '@/lib/utils'

const STYLES: Record<NivelAuditoria, string> = {
  INFO:    'bg-sky-100 text-sky-800',
  WARNING: 'bg-amber-100 text-amber-800',
  ERROR:   'bg-red-100 text-red-800',
  CRITICO: 'bg-red-200 text-red-900 font-semibold',
}

export function NivelBadge({ nivel }: { nivel: NivelAuditoria }) {
  return (
    <Badge variant="secondary" className={cn('text-xs', STYLES[nivel] ?? 'bg-gray-100 text-gray-700')}>
      {nivel}
    </Badge>
  )
}
