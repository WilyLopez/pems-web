'use client'

import { useIdleWarning } from '@/hooks/useIdleWarning'
import { ModalSesionExpirada } from '@/components/sesion/ModalSesionExpirada'
import { AvisoExpiracion } from '@/components/sesion/AvisoExpiracion'

export function SesionGuard() {
  useIdleWarning()
  return (
    <>
      <ModalSesionExpirada />
      <AvisoExpiracion />
    </>
  )
}
