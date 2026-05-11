'use client'

import { Camera, Shield, KeyRound, Calendar, MapPin, Building2, Clock } from 'lucide-react'
import { UsuarioAdmin, getEstadoAdmin } from '@/types/usuario-admin.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { RolBadge } from '@/components/admin/usuarios/RolBadge'
import { EstadoBadge } from '@/components/admin/usuarios/EstadoBadge'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'perfil' | 'seguridad' | 'contrasena'

function initials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface PerfilHeaderProps {
  admin: UsuarioAdmin
  onTabChange?: (tab: Tab) => void
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-white/50 shrink-0" />
      <span className="text-white/60">{label}:</span>
      <span className="text-white/90 font-medium truncate">{value}</span>
    </div>
  )
}

export function PerfilHeader({ admin, onTabChange }: PerfilHeaderProps) {
  const estado = getEstadoAdmin(admin)

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-card">
      <div
        className="relative px-6 pt-6 pb-8"
        style={{
          background: 'linear-gradient(135deg, #00AEEF 0%, #0086c3 60%, #005f8e 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-4 ring-white/30 shadow-xl">
              <AvatarImage src={admin.fotoPerfilUrl} alt={admin.nombre} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-black backdrop-blur-sm">
                {initials(admin.nombre)}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200/50"
              title="Cambiar foto"
            >
              <Camera className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {admin.nombre}
                </h2>
                <RolBadge rol={admin.rol} />
                <EstadoBadge estado={estado} />
              </div>
              <p className="text-sm text-white/70">{admin.correo}</p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <StatItem icon={Building2} label="Sede" value={`ID ${admin.idSede}`} />
              <StatItem
                icon={Clock}
                label="Ultimo acceso"
                value={admin.ultimoAcceso ? formatDateTime(admin.ultimoAcceso) : 'Nunca'}
              />
              <StatItem
                icon={Calendar}
                label="Miembro desde"
                value={formatDateTime(admin.fechaCreacion)}
              />
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 self-start">
            {onTabChange && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl gap-1.5 backdrop-blur-sm text-xs h-8"
                  onClick={() => onTabChange('seguridad')}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Seguridad
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl gap-1.5 backdrop-blur-sm text-xs h-8"
                  onClick={() => onTabChange('contrasena')}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Contrasena
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-3 flex flex-wrap gap-x-8 gap-y-1.5 border-t border-gray-100">
        {[
          { label: 'Intentos fallidos', value: admin.intentosFallidos?.toString() ?? '0', danger: (admin.intentosFallidos ?? 0) > 0 },
          { label: 'Cambio de contrasena', value: admin.debeCambiarContrasena ? 'Requerido' : 'No requerido', danger: !!admin.debeCambiarContrasena },
          { label: 'Estado', value: estado === 'BLOQUEADO' ? 'Bloqueado' : 'Activo', danger: estado === 'BLOQUEADO' },
        ].map(({ label, value, danger }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400">{label}:</span>
            <span className={cn('font-semibold', danger ? 'text-red-600' : 'text-gray-700')}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}