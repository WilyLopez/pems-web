import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  CREAR:      'bg-green-100 text-green-800',
  ACTUALIZAR: 'bg-blue-100 text-blue-800',
  ELIMINAR:   'bg-red-100 text-red-800',
  CONSULTAR:  'bg-gray-100 text-gray-700',
  LOGIN:      'bg-indigo-100 text-indigo-800',
  LOGOUT:     'bg-slate-100 text-slate-700',
}

export function AccionBadge({ accion }: { accion: string }) {
  return (
    <Badge variant="secondary" className={cn('font-medium text-xs', STYLES[accion] ?? 'bg-gray-100 text-gray-700')}>
      {accion}
    </Badge>
  )
}
