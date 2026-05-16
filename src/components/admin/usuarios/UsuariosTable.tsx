'use client'

import {
  Mail,
  Phone,
  Clock,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'
import { UsuarioAdmin, getEstadoAdmin } from '@/types/usuario-admin.types'
import { RolBadge } from './RolBadge'
import { EstadoBadge } from './EstadoBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { formatDateTime } from '@/lib/utils'
import {
  useActivarUsuarioAdmin,
  useDesactivarUsuarioAdmin,
} from '@/hooks/useUsuariosAdmin'
import { cn } from '@/lib/utils'

interface Props {
  usuarios: UsuarioAdmin[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

function initials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function UsuarioRow({ usuario }: { usuario: UsuarioAdmin }) {
  const estado = getEstadoAdmin(usuario)
  const activar = useActivarUsuarioAdmin()
  const desactivar = useDesactivarUsuarioAdmin()
  const isPending = activar.isPending || desactivar.isPending

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm',
        !usuario.activo && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={usuario.fotoPerfilUrl} alt={usuario.nombre} />
        <AvatarFallback className="bg-brand-gradient text-white text-sm font-semibold">
          {initials(usuario.nombre)}
        </AvatarFallback>
      </Avatar>

      {/* Info principal */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-sm text-gray-900">
            {usuario.nombre}
          </span>
          <RolBadge rol={usuario.rol} />
          <EstadoBadge estado={estado} />
          {usuario.debeCambiarContrasena && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
              <AlertTriangle className="h-3 w-3" /> Debe cambiar contraseña
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> {usuario.correo}
          </span>
          {usuario.telefono && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {usuario.telefono}
            </span>
          )}
          {usuario.ultimoAcceso && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{' '}
              {formatDateTime(usuario.ultimoAcceso)}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="shrink-0">
        {usuario.activo ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => desactivar.mutate(usuario.id)}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <UserX className="mr-1.5 h-3.5 w-3.5" />
            Desactivar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => activar.mutate(usuario.id)}
            className="text-xs text-green-600 border-green-200 hover:bg-green-50"
          >
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Activar
          </Button>
        )}
      </div>
    </div>
  )
}

export function UsuariosTable({
  usuarios,
  isLoading,
  isError,
  onRetry,
}: Props) {
  if (isError) return <ErrorState onRetry={onRetry} />

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          No hay administradores registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {usuarios.map((u) => (
        <UsuarioRow key={u.id} usuario={u} />
      ))}
    </div>
  )
}
