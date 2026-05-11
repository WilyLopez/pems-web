'use client'

import {
  Shield, Clock, AlertTriangle, CheckCircle2,
  Lock, Info, XCircle,
} from 'lucide-react'
import { UsuarioAdmin, getEstadoAdmin } from '@/types/usuario-admin.types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon:     React.ElementType
  label:    string
  value:    React.ReactNode
  sub?:     string
  variant?: 'default' | 'warning' | 'success' | 'danger'
}

const VARIANT = {
  default: { bg: 'bg-gray-50',   icon: 'text-gray-500',  border: 'border-gray-100' },
  warning: { bg: 'bg-amber-50',  icon: 'text-amber-600', border: 'border-amber-100' },
  success: { bg: 'bg-green-50',  icon: 'text-green-600', border: 'border-green-100' },
  danger:  { bg: 'bg-red-50',    icon: 'text-red-600',   border: 'border-red-100'   },
}

function StatCard({ icon: Icon, label, value, sub, variant = 'default' }: StatCardProps) {
  const v = VARIANT[variant]
  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', v.border, v.bg)}>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', v.bg === 'bg-gray-50' ? 'bg-white border border-gray-200' : v.bg)}>
        <Icon className={cn('h-4 w-4', v.icon)} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="text-sm font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function SeguridadInfo({ admin }: { admin: UsuarioAdmin }) {
  const estado        = getEstadoAdmin(admin)
  const estaBloqueado = estado === 'BLOQUEADO'

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Seguridad de la cuenta</h3>
          <p className="text-xs text-gray-500">
            Estado actual y registros de acceso a tu cuenta
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={Clock}
          label="Ultimo acceso"
          value={admin.ultimoAcceso ? formatDateTime(admin.ultimoAcceso) : 'Sin registros'}
          sub="Ultima sesion iniciada con exito"
          variant="default"
        />

        <StatCard
          icon={estaBloqueado ? Lock : CheckCircle2}
          label="Estado de la cuenta"
          value={estaBloqueado ? 'Bloqueada' : 'Activa'}
          sub={estaBloqueado
            ? `Hasta ${formatDateTime(admin.bloqueadoHasta!)}`
            : 'Sin restricciones activas'}
          variant={estaBloqueado ? 'danger' : 'success'}
        />

        <StatCard
          icon={AlertTriangle}
          label="Intentos de acceso fallidos"
          value={`${admin.intentosFallidos} intento${admin.intentosFallidos !== 1 ? 's' : ''}`}
          sub={admin.intentosFallidos > 0
            ? 'Revisa si alguien intento acceder a tu cuenta'
            : 'Sin actividad sospechosa'}
          variant={admin.intentosFallidos > 0 ? 'warning' : 'success'}
        />

        <StatCard
          icon={Shield}
          label="Cambio de contrasena"
          value={admin.debeCambiarContrasena ? 'Requerido' : 'No requerido'}
          sub={admin.debeCambiarContrasena
            ? 'Por politica de seguridad debes actualizar tu contrasena'
            : 'Tu contrasena esta al dia'}
          variant={admin.debeCambiarContrasena ? 'warning' : 'success'}
        />
      </div>

      {estaBloqueado && (
        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Cuenta bloqueada temporalmente</p>
            <p className="text-xs text-red-600 mt-1">
              Tu cuenta esta bloqueada por exceso de intentos fallidos.
              Se desbloqueara automaticamente el {formatDateTime(admin.bloqueadoHasta!)}.
              Si necesitas acceso urgente contacta al administrador principal.
            </p>
          </div>
        </div>
      )}

      {admin.debeCambiarContrasena && !estaBloqueado && (
        <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Se requiere cambiar la contrasena</p>
            <p className="text-xs text-amber-600 mt-1">
              Por politica de seguridad debes actualizar tu contrasena.
              Ve a la pestana de Contrasena para actualizarla.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recomendaciones de seguridad
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { ok: admin.intentosFallidos === 0,         msg: 'Sin intentos de acceso sospechosos' },
            { ok: !admin.debeCambiarContrasena,          msg: 'Contrasena actualizada' },
            { ok: !estaBloqueado,                        msg: 'Cuenta sin bloqueos' },
            { ok: !!admin.ultimoAcceso,                  msg: 'Historial de acceso registrado' },
          ].map(({ ok, msg }) => (
            <div key={msg} className="flex items-center gap-2">
              {ok
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              }
              <p className={cn('text-xs', ok ? 'text-gray-600' : 'text-red-600')}>{msg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}