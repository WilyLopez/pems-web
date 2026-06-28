import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  CREAR: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ACTUALIZAR:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ELIMINAR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  LOGIN:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  LOGOUT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  LOGIN_FALLIDO:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  BLOQUEO_CUENTA: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300',
  CONFIRMAR: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  CANCELAR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  REPROGRAMAR:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  FIRMAR:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  ABRIR:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CERRAR: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  ARQUEO: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  EMITIR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ANULAR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ACTIVAR:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DESACTIVAR:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  RESPONDER: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  MARCAR_SPAM:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

export function AccionBadge({ accion }: { accion: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium text-xs',
        STYLES[accion] ??
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      )}
    >
      {accion}
    </Badge>
  )
}
