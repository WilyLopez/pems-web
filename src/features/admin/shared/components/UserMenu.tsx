'use client'

import Link from 'next/link'
import {
  User,
  Settings,
  Shield,
  KeyRound,
  HelpCircle,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '@/components/ui/DropdownMenu'
import { Separator } from '@/components/ui/Separator'

interface UserMenuProps {
  nombre?: string | null
  correo?: string | null
  logout: () => void
}

export function UserMenu({ nombre, correo, logout }: UserMenuProps) {
  return (
    <DropdownMenuContent
      align="end"
      className="w-60 rounded-2xl p-1.5 shadow-card-hover"
    >
      <div className="px-3 py-2.5 mb-1">
        <p className="text-sm font-bold text-gray-900">{nombre ?? 'Usuario'}</p>
        <p className="text-xs text-gray-400 truncate">{correo ?? ''}</p>
      </div>

      <Separator className="my-1" />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/perfil"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Mi perfil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/admin/configuracion"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Configuracion</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/admin/preferencias"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Preferencias</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <Separator className="my-1" />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/perfil#seguridad"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Seguridad</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/auth/cambiar-contrasena"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <KeyRound className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Cambiar contrasena</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/admin/soporte"
            className="flex items-center gap-2.5 rounded-xl cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm">Soporte</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <Separator className="my-1" />

      <DropdownMenuItem
        onClick={logout}
        className="flex items-center gap-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
      >
        <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
          <LogOut className="h-3.5 w-3.5 text-destructive" />
        </div>
        <span className="text-sm font-medium">Cerrar sesión</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
