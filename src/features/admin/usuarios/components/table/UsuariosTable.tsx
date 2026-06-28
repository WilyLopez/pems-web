'use client'

import {
  AlertTriangle,
  Clock,
  Eye,
  KeyRound,
  LockOpen,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  ShieldAlert,
  User,
  UserCheck,
  UserX,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { UsuarioAdmin, getEstadoAdmin } from '../../types'
import { RolBadge } from '../ui/RolBadge'
import { EstadoBadge } from '../ui/EstadoBadge'
import { PaginacionUsuarios } from '../ui/PaginacionUsuarios'
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
import { useMutacionesUsuario } from '../../hooks/useUsuariosData'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { cn } from '@/lib/utils'

interface Props {
  paginados: UsuarioAdmin[]
  totalFiltrados: number
  totalGeneral: number
  totalPaginas: number
  pageActual: number
  onPageChange: (page: number) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  currentUserId?: number
  isSuperAdmin?: boolean
}

function initials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function mensajeVacio(
  search: string,
  rol: string,
  estado: string,
  totalGeneral: number
): string {
  if (totalGeneral === 0) return 'No hay usuarios registrados.'
  if (search && rol !== 'TODOS')
    return `No hay usuarios con rol ${rol} que coincidan con "${search}".`
  if (search) return `No se encontraron usuarios con "${search}".`
  if (rol !== 'TODOS') return `No hay usuarios con rol ${rol}.`
  if (estado !== 'TODOS') return `No hay usuarios en estado ${estado}.`
  return 'No se encontraron usuarios con los filtros aplicados.'
}

interface UsuarioRowProps {
  usuario: UsuarioAdmin
  currentUserId?: number
  isSuperAdmin?: boolean
}

function UsuarioRow({ usuario, currentUserId, isSuperAdmin }: UsuarioRowProps) {
  const { openModal } = useUsuariosNav()
  const { activarUsuario } = useMutacionesUsuario()

  const estado = getEstadoAdmin(usuario)
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
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={usuario.fotoPerfilUrl} alt={usuario.nombre} />
        <AvatarFallback className="bg-brand-gradient text-white text-sm font-semibold">
          {initials(usuario.nombre)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-medium text-sm text-gray-900">{usuario.nombre}</span>
          <RolBadge rol={usuario.rol} />
          <EstadoBadge estado={estado} />
          {usuario.debeCambiarContrasena && (
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600 border-none">
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
          {estado === 'BLOQUEADO' && usuario.bloqueadoHasta && (
            <span className="font-medium text-red-500">
              Desbloq.{' '}
              {formatDistanceToNow(new Date(usuario.bloqueadoHasta), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          )}
          {usuario.sedeNombre && (
            <span className="text-gray-400">{usuario.sedeNombre}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canToggle && (
          usuario.activo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal('desactivar', usuario.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <UserX className="mr-1.5 h-3.5 w-3.5" />
              Desactivar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={activarUsuario.isPending}
              onClick={() => activarUsuario.mutate(usuario.id)}
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
            <DropdownMenuItem onClick={() => openModal('ver', usuario.id)}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/perfil?userId=${usuario.id}`}>
                <User className="mr-2 h-4 w-4" /> Ver perfil completo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal('editar', usuario.id)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {!isSelf && !isSuperadminRow && (
              <DropdownMenuItem onClick={() => openModal('rol', usuario.id)}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Cambiar rol
              </DropdownMenuItem>
            )}
            {estado === 'BLOQUEADO' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openModal('desbloquear', usuario.id)}
                  className="text-blue-600 focus:text-blue-600"
                >
                  <LockOpen className="mr-2 h-4 w-4" /> Desbloquear cuenta
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openModal('reset', usuario.id)}
              className="text-amber-600 focus:text-amber-600"
            >
              <KeyRound className="mr-2 h-4 w-4" /> Restablecer contraseña
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function UsuariosTable({
  paginados,
  totalFiltrados,
  totalGeneral,
  totalPaginas,
  pageActual,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  currentUserId,
  isSuperAdmin,
}: Props) {
  const { search, rol, estado, setSearch, setRol, setEstado } = useUsuariosNav()

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
        <Select value={rol} onValueChange={setRol}>
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
        <Select value={estado} onValueChange={setEstado}>
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

      {paginados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            {mensajeVacio(search, rol, estado, totalGeneral)}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginados.map((u) => (
            <UsuarioRow
              key={u.id}
              usuario={u}
              currentUserId={currentUserId}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              {totalFiltrados} de {totalGeneral} usuario{totalGeneral !== 1 ? 's' : ''}
            </p>
            <PaginacionUsuarios
              pageActual={pageActual}
              totalPaginas={totalPaginas}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </>
  )
}
