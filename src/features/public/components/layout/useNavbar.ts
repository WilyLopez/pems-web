'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { useQuery } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente.service'
import { clienteKeys } from '@/features/cliente/shared/queryKeys'

const SCROLL_THRESHOLD = 60

export const navLinks = [
  { href: '/', label: 'Inicio', icon: 'Home' },
  { href: '/zona-de-juegos', label: 'Zona de Juegos', icon: 'Gamepad2' },
  { href: '/celebraciones', label: 'Celebraciones', icon: 'PartyPopper' },
  { href: '/nosotros', label: 'Nosotros', icon: 'Info' },
] as const

export function useNavbar() {
  const { nombre, correo, logout, isAdmin, isCliente, clientePerfilId } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const whatsappUrl = useWhatsAppUrl('Hola, quisiera más información sobre Kiki y Lala')

  const { data: perfil } = useQuery({
    queryKey: clienteKeys.perfil(clientePerfilId),
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: isCliente && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const nombreMostrar = perfil?.nombreCompleto || nombre || correo?.split('@')[0] || ''
  const primerNombre =
    perfil?.nombres?.split(' ')[0] || nombre?.split(' ')[0] || correo?.split('@')[0] || ''

  const isLanding = pathname === '/'
  const forceSolid = !isLanding

  useEffect(() => {
    if (forceSolid) return
    const handler = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [forceSolid])

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isSolid = forceSolid || scrolled

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)

  return {
    // nav state
    isSolid,
    mobileOpen,
    openMobile,
    closeMobile,
    isActive,
    // auth
    isAdmin,
    isCliente,
    logout,
    // user data
    nombre,
    correo,
    nombreMostrar,
    primerNombre,
    // extras
    whatsappUrl,
  }
}
