'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Ticket,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  CalendarDays,
  Gamepad2,
  Info,
  Home,
  PartyPopper,
  MessageCircle,
  Shield,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuth } from '@/hooks/useAuth'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/zona-de-juegos', label: 'Zona de Juegos', icon: Gamepad2 },
  { href: '/celebraciones', label: 'Celebraciones', icon: PartyPopper },
  { href: '/nosotros', label: 'Nosotros', icon: Info },
]

const SCROLL_THRESHOLD = 60

export function PublicNavbar() {
  const { user, logout, isAdmin, isCliente } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const whatsappUrl = useWhatsAppUrl('Hola, quisiera más información sobre Kiki y Lala')

  const isLanding = pathname === '/'
  const forceSolid = !isLanding

  useEffect(() => {
    if (forceSolid) return
    const handler = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [forceSolid])

  const isSolid = forceSolid || scrolled

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isSolid
          ? 'bg-white border-b border-gray-200 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo variant="secundario" size="sm" href="/" />

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
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
          ))}
        </nav>

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
                    isSolid
                      ? 'text-gray-700 hover:text-brand-azul'
                      : 'text-white hover:bg-white/15'
                  )}
                >
                  <User className="h-4 w-4" />
                  {user?.name?.split(' ')[0]}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
                  Cerrar sesion
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
                Iniciar sesion
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            asChild
            className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold px-5 rounded-full gap-1.5 shadow-sm"
          >
            <Link href="/reservar">
              <Ticket className="h-4 w-4" />
              Reservar
            </Link>
          </Button>
        </div>

        <button
          className={cn(
            'md:hidden p-2 rounded-lg transition-colors',
            isSolid
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-white hover:bg-white/15'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                  isActive(href)
                    ? 'text-brand-azul bg-brand-azul/10'
                    : 'text-gray-700 hover:text-brand-azul hover:bg-brand-azul/8'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-2">
              {isAdmin ? (
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-brand-azul/30 text-brand-azul"
                >
                  <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Panel Admin
                  </Link>
                </Button>
              ) : isCliente ? (
                <>
                  <Link
                    href="/cliente/mis-entradas"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Ticket className="h-4 w-4" />
                    Mis entradas
                  </Link>
                  <Link
                    href="/cliente/mis-reservas"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Mis reservas
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout() }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/8"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-gray-200"
                >
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar sesion
                  </Link>
                </Button>
              )}

              <Button
                asChild
                className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold"
              >
                <Link href="/reservar" onClick={() => setMobileOpen(false)}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Reservar
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
