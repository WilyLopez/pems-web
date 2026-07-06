import { z } from 'zod'
import type { LucideIcon } from 'lucide-react'
import { Building2, ImageIcon, Share2, Phone } from 'lucide-react'
import { soloDigitos } from './utils/telefono'

const urlOpcional = z
  .string()
  .url('Ingresa un enlace válido (https://...)')
  .optional()
  .or(z.literal(''))

const MENSAJE_TELEFONO = 'Ingresa 9 dígitos, solo números (ej: 987 654 321)'

const telefonoOpcional = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || soloDigitos(v).length === 9, {
    message: MENSAJE_TELEFONO,
  })

function esEnlaceDeDominio(valor: string, dominios: string[]): boolean {
  try {
    const host = new URL(valor).hostname.replace(/^www\./, '')
    return dominios.some((d) => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

const enlaceRedSocial = (dominios: string[], ejemplo: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || esEnlaceDeDominio(v, dominios), {
      message: `Ingresa un enlace de ${ejemplo}`,
    })

export const schema = z.object({
  nombreNegocio: z.string().min(1, 'Obligatorio').max(200),
  slogan: z.string().max(300).optional(),
  copyrightTexto: z.string().max(200).optional(),
  logoUrl: urlOpcional,
  logoSecundarioUrl: urlOpcional,
  mascota1Url: urlOpcional,
  mascota2Url: urlOpcional,
  faviconUrl: urlOpcional,
  telefono: telefonoOpcional,
  telefonoSecundario: telefonoOpcional,
  whatsapp: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || soloDigitos(v).length === 9, {
      message: MENSAJE_TELEFONO,
    }),
  correo: z.string().email('Email inválido').optional().or(z.literal('')),
  correoSecundario: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  facebookUrl: enlaceRedSocial(['facebook.com', 'fb.com', 'fb.me'], 'Facebook'),
  instagramUrl: enlaceRedSocial(['instagram.com', 'instagr.am'], 'Instagram'),
  tiktokUrl: enlaceRedSocial(['tiktok.com'], 'TikTok'),
  youtubeUrl: enlaceRedSocial(['youtube.com', 'youtu.be'], 'YouTube'),
})

export type FormValues = z.infer<typeof schema>

export type SectionId = 'negocio' | 'contacto' | 'logos' | 'redes'

export const DEFAULT_SECTION: SectionId = 'negocio'

export interface NavItem {
  id: SectionId
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'negocio', label: 'Negocio', icon: Building2 },
  { id: 'contacto', label: 'Contacto', icon: Phone },
  { id: 'logos', label: 'Marca', icon: ImageIcon },
  { id: 'redes', label: 'Redes sociales', icon: Share2 },
]
