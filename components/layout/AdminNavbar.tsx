'use client'

import { Bell, LogOut, Menu, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { getInitials } from '@/lib/utils'

export function AdminNavbar() {
  const { user, logout } = useAuth()
  const { toggle } = useSidebarStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-rosa rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-brand-azul text-white font-bold">
                  {user?.name ? getInitials(user.name) : 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-semibold">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}