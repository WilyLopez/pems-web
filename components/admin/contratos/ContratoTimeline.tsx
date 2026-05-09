import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FilePen, CheckCircle, Send, Clock, XCircle, Archive,
  Upload, RefreshCw,
} from 'lucide-react'
import { ActividadContrato } from '@/types/contrato.types'
import { cn } from '@/lib/utils'

const ACCION_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  CREADO:           { icon: FilePen,     color: 'bg-gray-100 text-gray-600'   },
  ACTUALIZADO:      { icon: RefreshCw,   color: 'bg-blue-100 text-blue-700'   },
  ENVIADO:          { icon: Send,        color: 'bg-blue-100 text-blue-700'   },
  FIRMADO:          { icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  CANCELADO:        { icon: XCircle,     color: 'bg-red-100 text-red-700'     },
  ARCHIVADO:        { icon: Archive,     color: 'bg-slate-100 text-slate-600' },
  DOCUMENTO_SUBIDO: { icon: Upload,      color: 'bg-purple-100 text-purple-700'},
  DEFAULT:          { icon: Clock,       color: 'bg-gray-100 text-gray-500'   },
}

interface ContratoTimelineProps {
  actividades: ActividadContrato[]
}

export function ContratoTimeline({ actividades }: ContratoTimelineProps) {
  if (!actividades.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">Sin actividad registrada</p>
    )
  }

  return (
    <ol className="relative space-y-4">
      {actividades.map((a, i) => {
        const cfg = ACCION_CONFIG[a.accion] ?? ACCION_CONFIG.DEFAULT
        const Icon = cfg.icon
        return (
          <li key={a.id} className="flex gap-3 relative">
            {i < actividades.length - 1 && (
              <div className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-100" />
            )}
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 z-10', cfg.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-xs font-bold text-gray-900">{a.accion.replace('_', ' ')}</p>
              {a.descripcion && (
                <p className="text-xs text-gray-500 mt-0.5">{a.descripcion}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                {a.usuario} &middot;{' '}
                {format(parseISO(a.fechaAccion), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}