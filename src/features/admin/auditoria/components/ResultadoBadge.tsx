import { cn } from '@/lib/utils'
import { ResultadoAuditoria } from '../types'

const STYLES: Record<ResultadoAuditoria, string> = {
  EXITOSO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FALLIDO: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PARCIAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

export function ResultadoBadge({ resultado }: { resultado: ResultadoAuditoria }) {
  return (
    <span
      className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium',
        STYLES[resultado] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      )}
    >
      {resultado}
    </span>
  )
}
