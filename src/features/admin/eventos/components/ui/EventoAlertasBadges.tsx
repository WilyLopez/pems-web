import { AlertTriangle, CheckCircle2, CreditCard, FileText } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { EventoPrivado, IndicadorEvento, calcularIndicadores } from '../../types'

const ICONO: Record<IndicadorEvento['tipo'], React.ElementType> = {
  CONTRATO:  FileText,
  PAGO:      CreditCard,
  CHECKLIST: CheckCircle2,
  PROVEEDOR: AlertTriangle,
}

const COLOR_ICONO: Record<IndicadorEvento['nivel'], string> = {
  DANGER:  'text-red-500',
  WARNING: 'text-amber-500',
  OK:      'text-green-500',
}

const COLOR_BADGE: Record<IndicadorEvento['nivel'], string> = {
  DANGER:  'bg-red-100 text-red-700 border-red-200',
  WARNING: 'bg-amber-100 text-amber-700 border-amber-200',
  OK:      'bg-green-100 text-green-700 border-green-200',
}

interface EventoAlertasBadgesProps {
  evento: EventoPrivado
  variant?: 'icons' | 'badges'
}

export function EventoAlertasBadges({ evento, variant = 'icons' }: EventoAlertasBadgesProps) {
  const indicadores = calcularIndicadores(evento)

  if (!indicadores.length) {
    return <CheckCircle2 className="h-4 w-4 text-green-400" />
  }

  if (variant === 'badges') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {indicadores.map((ind, i) => (
          <Badge
            key={i}
            variant="outline"
            className={cn('text-xs gap-1.5', COLOR_BADGE[ind.nivel])}
          >
            {ind.mensaje}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {indicadores.map((ind, i) => {
          const Icon = ICONO[ind.tipo] ?? AlertTriangle
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span>
                  <Icon className={cn('h-3.5 w-3.5', COLOR_ICONO[ind.nivel])} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{ind.mensaje}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
