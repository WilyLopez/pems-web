import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { NivelAuditoria } from '../types'

const STYLES: Record<NivelAuditoria, string> = {
  INFO: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  WARNING:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CRITICAL:
    'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300 font-semibold',
}

export function NivelBadge({ nivel }: { nivel: NivelAuditoria }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-xs',
        STYLES[nivel] ??
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      )}
    >
      {nivel}
    </Badge>
  )
}
