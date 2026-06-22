import { cn } from '@/lib/utils'

const CONFIG: Record<string, { label: string; cls: string }> = {
  PENDIENTE:    { label: 'Pendiente',    cls: 'bg-amber-100 text-amber-700' },
  CONFIRMADA:   { label: 'Confirmada',   cls: 'bg-green-100 text-green-700' },
  COMPLETADA:   { label: 'Completada',   cls: 'bg-blue-100 text-blue-700' },
  CANCELADA:    { label: 'Cancelada',    cls: 'bg-red-100 text-red-700' },
  REPROGRAMADA: { label: 'Reprogramada', cls: 'bg-purple-100 text-purple-700' },
  SOLICITADA:   { label: 'Solicitada',   cls: 'bg-gray-100 text-gray-600' },
}

export function EstadoBadge({ estado, compact }: { estado: string; compact?: boolean }) {
  const c = CONFIG[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full',
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        c.cls
      )}
    >
      {c.label}
    </span>
  )
}
