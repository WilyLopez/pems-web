import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDIENTE:    { label: 'Pendiente',    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  CONFIRMADA:   { label: 'Confirmada',   className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  REPROGRAMADA: { label: 'Reprogramada', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  COMPLETADA:   { label: 'Completada',   className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  CANCELADA:    { label: 'Cancelada',    className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  SOLICITADA:   { label: 'Solicitada',   className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  BORRADOR:     { label: 'Borrador',     className: 'bg-slate-100 text-slate-800 hover:bg-slate-100' },
  FIRMADO:      { label: 'Firmado',      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
  EMITIDO:      { label: 'Emitido',      className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  RECHAZADO:    { label: 'Rechazado',    className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  ANULADO:      { label: 'Anulado',      className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}