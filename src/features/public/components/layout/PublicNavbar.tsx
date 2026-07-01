'use client'

import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavbar } from './useNavbar'
import { NavDesktop } from './NavDesktop'
import { NavMobileDrawer } from './NavMobileDrawer'

export function PublicNavbar() {
  const {
    isSolid,
    mobileOpen,
    openMobile,
    closeMobile,
    isActive,
    isAdmin,
    isCliente,
    logout,
    correo,
    nombreMostrar,
    primerNombre,
    whatsappUrl,
  } = useNavbar()

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          isSolid
            ? 'bg-white border-b border-gray-200 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <NavDesktop
            isSolid={isSolid}
            isActive={isActive}
            isAdmin={isAdmin}
            isCliente={isCliente}
            logout={logout}
            nombreMostrar={nombreMostrar}
            primerNombre={primerNombre}
            correo={correo ?? undefined}
          />

          {/* Mobile hamburger button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors shrink-0',
              isSolid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/15'
            )}
            onClick={openMobile}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer (rendered outside header to allow full-page overlay) */}
      <NavMobileDrawer
        open={mobileOpen}
        onClose={closeMobile}
        isActive={isActive}
        isAdmin={isAdmin}
        isCliente={isCliente}
        logout={logout}
        nombreMostrar={nombreMostrar}
        correo={correo ?? undefined}
        whatsappUrl={whatsappUrl ?? undefined}
      />
    </>
  )
}
