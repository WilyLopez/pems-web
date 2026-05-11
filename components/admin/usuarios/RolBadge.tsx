import { Badge } from '@/components/ui/Badge'
import { RolAdmin } from '@/types/usuario-admin.types'
import { cn } from '@/lib/utils'

const STYLES: Record<RolAdmin, string> = {
  GERENTE:       'bg-purple-100 text-purple-800',
  SUBGERENTE:    'bg-blue-100 text-blue-800',
  ADMINISTRATIVO:'bg-gray-100 text-gray-700',
}

const LABELS: Record<RolAdmin, string> = {
  GERENTE:       'Gerente',
  SUBGERENTE:    'Subgerente',
  ADMINISTRATIVO:'Administrativo',
}

export function RolBadge({ rol }: { rol: RolAdmin }) {
  return (
    <Badge variant="secondary" className={cn('font-medium', STYLES[rol] ?? 'bg-gray-100 text-gray-700')}>
      {LABELS[rol] ?? rol}
    </Badge>
  )
}
