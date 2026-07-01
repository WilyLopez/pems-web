'use client'

import Link from 'next/link'
import {
  Home,
  Gamepad2,
  PartyPopper,
  Info,
  Shield,
  LogIn,
  LogOut,
  Ticket,
  CalendarDays,
  User,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/brand/Logo'
import { cn, getInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { navLinks } from './useNavbar'

const ICON_MAP = { Home, Gamepad2, PartyPopper, Info }

interface NavDesktopProps {
  isSolid: boolean
  isActive: (href: string) => boolean
  isAdmin: boolean
  isCliente: boolean
  logout: () => void
  nombreMostrar: string
  primerNombre: string
  correo?: string
}

export function NavDesktop({
  isSolid,
  isActive,
  isAdmin,
  isCliente,
  logout,
  nombreMostrar,
  primerNombre,
  correo,
}: NavDesktopProps) {
  return (
    <>
      {/* Logo */}
      <Logo variant="secundario" size="sm" href="/" />

      {/* Links */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label, icon }) => {
          const Icon = ICON_MAP[icon as keyof typeof ICON_MAP]
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                isActive(href)
                  ? isSolid
                    ? 'text-brand-azul bg-brand-azul/10'
                    : 'text-white bg-white/20'
                  : isSolid
                    ? 'text-gray-700 hover:text-brand-azul hover:bg-brand-azul/8'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right actions */}
      <div className="hidden md:flex items-center gap-2">
        {isAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              'font-semibold gap-1.5',
              isSolid
                ? 'text-gray-700 hover:text-brand-azul hover:bg-brand-azul/8'
                : 'text-white hover:bg-white/15'
            )}
          >
            <Link href="/admin/dashboard">
              <Shield className="h-4 w-4" />
              Panel Admin
            </Link>
          </Button>
        ) : isCliente ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 font-semibold',
                  isSolid ? 'text-gray-700 hover:text-brand-azul' : 'text-white hover:bg-white/15'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-brand-rosa flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
                </div>
                {primerNombre}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-xl">
              <div className="px-3 py-2 flex items-center gap-2 mb-1 border-b border-gray-50 pb-2">
                <div className="w-7 h-7 rounded-full bg-brand-rosa flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-900 truncate leading-tight">{nombreMostrar}</p>
                  <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">{correo}</p>
                </div>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/cliente/mis-entradas">
                  <Ticket className="mr-2 h-4 w-4" />
                  Mis entradas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cliente/mis-reservas">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Mis reservas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cliente/mi-cuenta">
                  <User className="mr-2 h-4 w-4" />
                  Mi cuenta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive focus:bg-destructive/8"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              'font-semibold gap-1.5',
              isSolid
                ? 'text-gray-700 hover:text-brand-azul hover:bg-brand-azul/8'
                : 'text-white hover:bg-white/15'
            )}
          >
            <Link href="/auth/login">
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          </Button>
        )}

        <Button
          size="sm"
          asChild
          className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold px-5 rounded-full gap-1.5 shadow-sm"
        >
          <Link href="/cliente/reservar">
            <Ticket className="h-4 w-4" />
            Reservar
          </Link>
        </Button>
      </div>
    </>
  )
}
