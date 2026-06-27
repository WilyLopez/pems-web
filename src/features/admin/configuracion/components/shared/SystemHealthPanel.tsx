'use client'

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useConfiguracionAdmin } from '@/hooks/useConfiguracionPublica'
import { toConfigMap, useSede } from '../../hooks/useConfiguracionData'
import { useConfiguracionNav } from '../../hooks/useConfiguracionNav'
import type { SeccionConfig } from '../../hooks/useConfiguracionNav'
import type { ConfiguracionSistema } from '../../types'

interface HealthAlert {
  level:   'warning' | 'info'
  message: string
  action?: { label: string; seccion: SeccionConfig; modal: 'view' | 'edit' }
}

interface SystemHealthPanelProps {
  idSede:  number
  configs: ConfiguracionSistema[]
}

export function SystemHealthPanel({ idSede, configs }: SystemHealthPanelProps) {
  const { data: configPublica } = useConfiguracionAdmin()
  const { data: sede }          = useSede(idSede)
  const { abrirSeccion }        = useConfiguracionNav()

  const m      = toConfigMap(configs)
  const alerts: HealthAlert[] = []

  if (configPublica?.mantenimientoActivo) {
    alerts.push({
      level:   'warning',
      message: 'El sitio web está en modo mantenimiento. Los visitantes no pueden acceder.',
      action:  { label: 'Desactivar', seccion: 'sistema', modal: 'edit' },
    })
  }

  const intentos = Number(m.INTENTOS_LOGIN_ANTES_BLOQUEO)
  if (Number.isFinite(intentos) && intentos >= 1 && intentos <= 2) {
    alerts.push({
      level:   'warning',
      message: `Solo ${intentos} intento(s) de login antes de bloquear la cuenta. Riesgo de auto-bloqueo accidental.`,
      action:  { label: 'Ajustar', seccion: 'seguridad', modal: 'edit' },
    })
  }

  const sesionMin = Number(m.EXPIRACION_SESION_ADMIN_MIN)
  if (Number.isFinite(sesionMin) && sesionMin >= 1 && sesionMin < 15) {
    alerts.push({
      level:   'warning',
      message: `La sesión del administrador expira en ${sesionMin} min de inactividad.`,
      action:  { label: 'Ajustar', seccion: 'seguridad', modal: 'edit' },
    })
  }

  const bloqueoMin = Number(m.DURACION_BLOQUEO_LOGIN_MIN)
  if (Number.isFinite(bloqueoMin) && bloqueoMin >= 1 && bloqueoMin < 5) {
    alerts.push({
      level:   'info',
      message: `Duración de bloqueo de cuenta: ${bloqueoMin} min. Un tiempo muy corto puede no disuadir ataques repetidos.`,
      action:  { label: 'Revisar', seccion: 'seguridad', modal: 'edit' },
    })
  }

  if (sede && !sede.ruc) {
    alerts.push({
      level:   'info',
      message: 'La sede no tiene RUC registrado. Es obligatorio para emitir comprobantes electrónicos.',
      action:  { label: 'Configurar', seccion: 'sede', modal: 'edit' },
    })
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
        Sistema operando normalmente. No hay advertencias activas.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const isWarning = alert.level === 'warning'
        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              isWarning
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : 'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            {isWarning
              ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              : <Info          className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            }
            <span className="flex-1 leading-snug">{alert.message}</span>
            {alert.action && (
              <Button
                size="sm"
                variant="ghost"
                className={`shrink-0 h-auto py-0.5 px-2 text-xs font-medium ${
                  isWarning
                    ? 'text-amber-800 hover:bg-amber-100'
                    : 'text-blue-800 hover:bg-blue-100'
                }`}
                onClick={() => abrirSeccion(alert.action!.seccion, alert.action!.modal)}
              >
                {alert.action.label}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
