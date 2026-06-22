import { Badge } from '@/components/ui/Badge'
import { RolAdmin } from '../../types'
import { cn } from '@/lib/utils'

const STYLES: Record<RolAdmin, string> = {
  SUPERADMIN: 'bg-red-100 text-red-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  CAJERO: 'bg-blue-100 text-blue-800',
}

const LABELS: Record<RolAdmin, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
}

export function RolBadge({ rol }: { rol: RolAdmin }) {
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium', STYLES[rol] ?? 'bg-gray-100 text-gray-700')}
    >
      {LABELS[rol] ?? rol}
    </Badge>
  )
}
