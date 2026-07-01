'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  Home,
  Gamepad2,
  PartyPopper,
  Info,
  Ticket,
  CalendarDays,
  User,
  LogIn,
  LogOut,
  Shield,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { cn, getInitials } from '@/lib/utils'
import { navLinks } from './useNavbar'

const ICON_MAP = { Home, Gamepad2, PartyPopper, Info }

interface NavMobileDrawerProps {
  open: boolean
  onClose: () => void
  isActive: (href: string) => boolean
  isAdmin: boolean
  isCliente: boolean
  logout: () => void
  nombreMostrar: string
  correo?: string
  whatsappUrl?: string | null
}

export function NavMobileDrawer({
  open,
  onClose,
  isActive,
  isAdmin,
  isCliente,
  logout,
  nombreMostrar,
  correo,
  whatsappUrl,
}: NavMobileDrawerProps) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides from the right */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo variant="secundario" size="sm" href="/" onClick={onClose} />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* User profile section */}
          {(isCliente || isAdmin) && (
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-rosa to-brand-azul flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                  {nombreMostrar ? getInitials(nombreMostrar) : isAdmin ? 'A' : 'C'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{nombreMostrar || 'Usuario'}</p>
                  {correo && <p className="text-xs text-gray-400 truncate mt-0.5">{correo}</p>}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-azul bg-brand-azul/10 px-2 py-0.5 rounded-full mt-1">
                      <Shield className="h-2.5 w-2.5" />
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="px-3 py-4 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Navegar
            </p>
            {navLinks.map(({ href, label, icon }) => {
              const Icon = ICON_MAP[icon as keyof typeof ICON_MAP]
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all',
                    active
                      ? 'text-brand-azul bg-brand-azul/10'
                      : 'text-gray-700 hover:text-brand-azul hover:bg-brand-azul/6'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    active ? 'bg-brand-azul text-white' : 'bg-gray-100 text-gray-500'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="h-4 w-4 text-brand-azul/50" />}
                </Link>
              )
            })}
          </nav>

          {/* Client account links */}
          {isCliente && (
            <div className="px-3 pb-4 space-y-1 border-t border-gray-100 pt-4 mx-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Mi cuenta
              </p>
              <Link
                href="/cliente/mis-entradas"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-brand-rosa hover:bg-brand-rosa/6 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Ticket className="h-4 w-4 text-gray-500" />
                </div>
                Mis entradas
              </Link>
              <Link
                href="/cliente/mis-reservas"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-brand-rosa hover:bg-brand-rosa/6 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                </div>
                Mis reservas
              </Link>
              <Link
                href="/cliente/mi-cuenta"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-brand-rosa hover:bg-brand-rosa/6 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                Mi cuenta
              </Link>
            </div>
          )}

          {/* Admin link */}
          {isAdmin && (
            <div className="px-3 pb-4 border-t border-gray-100 pt-4 mx-3">
              <Link
                href="/admin/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-brand-azul hover:bg-brand-azul/6 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-brand-azul" />
                </div>
                Panel de administración
                <ChevronRight className="h-4 w-4 ml-auto text-brand-azul/40" />
              </Link>
            </div>
          )}

          {/* WhatsApp */}
          {whatsappUrl && (
            <div className="px-3 pb-4 border-t border-gray-100 pt-4 mx-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                </div>
                Contáctanos por WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* ── Footer CTA (always visible) ── */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2 bg-gray-50/60">
          <Button
            asChild
            className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold gap-2 shadow-sm"
          >
            <Link href="/cliente/reservar" onClick={onClose}>
              <Ticket className="h-4 w-4" />
              Reservar ahora
            </Link>
          </Button>

          {!isCliente && !isAdmin && (
            <Button
              asChild
              variant="outline"
              className="w-full rounded-full border-gray-200 text-gray-700 gap-2"
            >
              <Link href="/auth/login" onClick={onClose}>
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
            </Button>
          )}

          {(isCliente || isAdmin) && (
            <button
              onClick={() => {
                onClose()
                logout()
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </>
  )
}
