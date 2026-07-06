'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { useQuery } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente.service'
import { clienteKeys } from '@/features/cliente/shared/queryKeys'

export const navLinks = [
  { href: '/', label: 'Inicio', icon: 'Home' },
  { href: '/juegos', label: 'Juegos', icon: 'Gamepad2' },
  { href: '/celebraciones', label: 'Celebraciones', icon: 'PartyPopper' },
  { href: '/nosotros', label: 'Nosotros', icon: 'Info' },
  { href: '/contacto', label: 'Contacto', icon: 'Phone' },
] as const

export function useNavbar() {
  const { nombre, correo, logout, isAdmin, isCliente, clientePerfilId } =
    useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const whatsappUrl = useWhatsAppUrl(
    'Hola, quisiera más información sobre Kiki y Lala'
  )

  const { data: perfil } = useQuery({
    queryKey: clienteKeys.perfil(clientePerfilId),
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: isCliente && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const nombreMostrar =
    perfil?.nombreCompleto || nombre || correo?.split('@')[0] || ''
  const primerNombre =
    perfil?.nombres?.split(' ')[0] ||
    nombre?.split(' ')[0] ||
    correo?.split('@')[0] ||
    ''

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isSolid = true

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')

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
