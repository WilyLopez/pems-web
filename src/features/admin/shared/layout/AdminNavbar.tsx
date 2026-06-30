'use client'

import { Menu, ExternalLink, Search, Bell, LogOut, User, Settings, Shield, KeyRound, SlidersHorizontal, HelpCircle, Check, ShoppingBag, Ticket, PartyPopper, Wallet, FileText, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import type { TipoVisual } from '@/types/notificaciones.types'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn, getInitials, fileUrl } from '@/lib/utils'
import Link from 'next/link'
import { GlobalSearch } from '../components/GlobalSearch'
import { NotificacionesMenu } from '../components/NotificacionesMenu'
import { UserMenu } from '../components/UserMenu'

export const TIPO_ICON: Record<TipoVisual, LucideIcon> = {
  reserva: Ticket,
  evento: PartyPopper,
  pago: Wallet,
  contrato: FileText,
  caja: ShoppingBag,
  sistema: Info,
}

export const TIPO_BADGE: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul/10 text-brand-azul',
  evento: 'bg-brand-rosa/10 text-brand-rosa',
  pago: 'bg-amber-50 text-amber-600',
  contrato: 'bg-green-50 text-green-600',
  caja: 'bg-orange-50 text-orange-600',
  sistema: 'bg-gray-100 text-gray-500',
}

export const DOT_COLOR: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul',
  evento: 'bg-brand-rosa',
  pago: 'bg-amber-500',
  contrato: 'bg-green-500',
  caja: 'bg-orange-500',
  sistema: 'bg-gray-400',
}

export function AdminNavbar() {
  const { nombre, correo, fotoPerfilUrl, logout } = useAuth()
  const { toggleMobile } = useSidebarStore()
  useNotificaciones()

  const avatarUrl = fileUrl(fotoPerfilUrl)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 px-4 sm:px-6 glass border-b border-gray-100">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="lg:hidden h-9 w-9 rounded-xl hover:bg-gray-100"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </Button>

      <div className="flex items-center gap-1.5 ml-auto flex-1 justify-end">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8 transition-colors"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver sitio
          </Link>
        </Button>

        <GlobalSearch />
        <NotificacionesMenu />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-9 px-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-7 w-7">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={nombre ?? ''} />}
                <AvatarFallback className="text-xs bg-brand-azul text-white font-black">
                  {nombre ? getInitials(nombre) : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">
                  {nombre?.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                  Administrador
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <UserMenu nombre={nombre} correo={correo} logout={logout} />
        </DropdownMenu>
      </div>
    </header>
  )
}
