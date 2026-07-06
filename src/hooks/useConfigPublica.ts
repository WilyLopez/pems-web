'use client'

import { useMemo } from 'react'
import { useConfiguracionPublica } from './useConfiguracionPublica'
import type { ConfiguracionPublica } from '@/types/configuracion-publica.types'

const DEFAULTS: Partial<ConfiguracionPublica> = {
  nombreNegocio: 'Kiki y Lala',
  slogan: 'Diversión y juego para toda la familia',
  telefono: '987 654 321',
  whatsapp: '51987654321',
  correo: 'contacto@kikiylala.com',
}

export function useConfigPublica() {
  const query = useConfiguracionPublica()

  const config = useMemo<ConfiguracionPublica | undefined>(() => {
    if (!query.data) return undefined
    return { ...DEFAULTS, ...query.data } as ConfiguracionPublica
  }, [query.data])

  return { ...query, config }
}

export function useWhatsAppUrl(mensaje?: string) {
  const { config } = useConfigPublica()
  return useMemo(() => {
    const numero = config?.whatsapp?.replace(/\D/g, '')
    if (!numero) return null
    const texto = mensaje ? encodeURIComponent(mensaje) : ''
    return `https://wa.me/${numero}${texto ? `?text=${texto}` : ''}`
  }, [config?.whatsapp, mensaje])
}
