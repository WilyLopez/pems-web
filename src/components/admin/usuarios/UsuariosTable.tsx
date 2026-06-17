'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Clock,
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
} from 'lucide-react'
import { UsuarioAdmin, getEstadoAdmin, RolAdmin, EstadoAdmin } from '@/types/usuario-admin.types'
import { RolBadge } from './RolBadge'
import { EstadoBadge } from './EstadoBadge'
import { VerDetalleModal } from './VerDetalleModal'
import { EditarUsuarioModal } from './EditarUsuarioModal'
import { CambiarRolModal } from './CambiarRolModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
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
  currentUserId?: number
  isSuperAdmin?: boolean
}

function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function UsuarioRow({
  usuario,
  onVer,
  onEditar,
  onCambiarRol,
  onReset,
  currentUserId,
  isSuperAdmin,
}: {
  usuario: UsuarioAdmin
  onVer: () => void
  onEditar: () => void
  onCambiarRol: () => void
  onReset: () => void
  currentUserId?: number
  isSuperAdmin?: boolean
}) {
  const estado = getEstadoAdmin(usuario)
  const activar = useActivarUsuarioAdmin()
  const desactivar = useDesactivarUsuarioAdmin()
  const isPending = activar.isPending || desactivar.isPending
  const isSelf = currentUserId === usuario.id
  const isSuperadminRow = usuario.rol === 'SUPERADMIN'
  const canToggle = !isSelf && (!isSuperadminRow || isSuperAdmin)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm',
        !usuario.activo && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={usuario.fotoPerfilUrl} alt={usuario.nombre} />
        <AvatarFallback className="bg-brand-gradient text-white text-sm font-semibold">
          {initials(usuario.nombre)}
        </AvatarFallback>
      </Avatar>

      {/* Info principal */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-medium text-sm text-gray-900">{usuario.nombre}</span>
          <RolBadge rol={usuario.rol} />
          <EstadoBadge estado={estado} />
          {usuario.debeCambiarContrasena && (
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600">
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
              <Clock className="h-3 w-3" /> {formatDateTime(usuario.ultimoAcceso)}
            </span>
          )}
          {usuario.sedeNombre && (
            <span className="text-gray-400">{usuario.sedeNombre}</span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-2">
        {canToggle && (
          usuario.activo ? (
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
          )
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Más opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onVer}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditar}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {!isSelf && !isSuperadminRow && (
              <DropdownMenuItem onClick={onCambiarRol}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Cambiar rol
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onReset} className="text-amber-600 focus:text-amber-600">
              <KeyRound className="mr-2 h-4 w-4" /> Restablecer contraseña
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function UsuariosTable({ usuarios, isLoading, isError, onRetry, currentUserId, isSuperAdmin }: Props) {
  const [search, setSearch]   = useState('')
  const [rolFil, setRolFil]   = useState<string>('TODOS')
  const [estadoFil, setEstadoFil] = useState<string>('TODOS')

  const [verUsuario, setVerUsuario]       = useState<UsuarioAdmin | null>(null)
  const [editarUsuario, setEditarUsuario] = useState<UsuarioAdmin | null>(null)
  const [rolUsuario, setRolUsuario]       = useState<UsuarioAdmin | null>(null)
  const [resetUsuario, setResetUsuario]   = useState<UsuarioAdmin | null>(null)

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      const matchSearch =
        !search ||
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.correo.toLowerCase().includes(search.toLowerCase())
      const matchRol = rolFil === 'TODOS' || u.rol === rolFil
      const estado = getEstadoAdmin(u)
      const matchEstado = estadoFil === 'TODOS' || estado === estadoFil
      return matchSearch && matchRol && matchEstado
    })
  }, [usuarios, search, rolFil, estadoFil])

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

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={rolFil} onValueChange={setRolFil}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los roles</SelectItem>
            <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="CAJERO">Cajero</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estadoFil} onValueChange={setEstadoFil}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            <SelectItem value="ACTIVO">Activo</SelectItem>
            <SelectItem value="INACTIVO">Inactivo</SelectItem>
            <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            {usuarios.length === 0
              ? 'No hay usuarios registrados.'
              : 'No se encontraron usuarios con los filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <UsuarioRow
              key={u.id}
              usuario={u}
              currentUserId={currentUserId}
              isSuperAdmin={isSuperAdmin}
              onVer={() => setVerUsuario(u)}
              onEditar={() => setEditarUsuario(u)}
              onCambiarRol={() => setRolUsuario(u)}
              onReset={() => setResetUsuario(u)}
            />
          ))}
          <p className="text-right text-xs text-muted-foreground">
            {filtered.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Modals */}
      <VerDetalleModal
        usuario={verUsuario}
        open={!!verUsuario}
        onClose={() => setVerUsuario(null)}
      />
      <EditarUsuarioModal
        usuario={editarUsuario}
        open={!!editarUsuario}
        onClose={() => setEditarUsuario(null)}
      />
      <CambiarRolModal
        usuario={rolUsuario}
        open={!!rolUsuario}
        onClose={() => setRolUsuario(null)}
      />
      <ResetPasswordModal
        usuario={resetUsuario}
        open={!!resetUsuario}
        onClose={() => setResetUsuario(null)}
      />
    </>
  )
}
