import { z } from 'zod'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  ImageIcon,
  Share2,
  Search,
  Palette,
  Phone,
} from 'lucide-react'

export const schema = z.object({
  nombreNegocio: z.string().min(1, 'Obligatorio').max(200),
  slogan: z.string().max(300).optional(),
  copyrightTexto: z.string().max(200).optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  telefono: z.string().max(20).optional(),
  telefonoSecundario: z.string().max(20).optional(),
  whatsapp: z
    .string()
    .regex(/^\d{7,15}$/, 'Solo números sin espacios (ej: 51974123456)')
    .optional()
    .or(z.literal('')),
  correo: z.string().email('Email inválido').optional().or(z.literal('')),
  correoSecundario: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  direccion: z.string().max(300).optional(),
  googleMapsUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  horarioSemana: z.string().max(100).optional(),
  horarioFinDeSemana: z.string().max(100).optional(),
  facebookUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  instagramUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  tiktokUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  youtubeUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(500).optional(),
  openGraphTitle: z.string().max(100).optional(),
  openGraphDescription: z.string().max(300).optional(),
  openGraphImageUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  googleAnalyticsId: z.string().max(50).optional(),
  metaPixelId: z.string().max(50).optional(),
  colorTema: z.string().max(20).optional(),
  colorSecundario: z.string().max(20).optional(),
})

export type FormValues = z.infer<typeof schema>

export type SectionId =
  | 'negocio'
  | 'contacto'
  | 'logos'
  | 'redes'
  | 'seo'
  | 'visual'

export const DEFAULT_SECTION: SectionId = 'negocio'

export interface NavItem {
  id: SectionId
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'negocio', label: 'Negocio', icon: Building2 },
  { id: 'contacto', label: 'Contacto', icon: Phone },
  { id: 'logos', label: 'Logos & Favicon', icon: ImageIcon },
  { id: 'redes', label: 'Redes sociales', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'visual', label: 'Visual', icon: Palette },
]

export interface AssetEntry {
  url: string
  nombre: string
  fechaSubida: string
  tamanioBytes?: number
  tipo: 'logo' | 'favicon'
}

export const HISTORY_KEY = 'pems_asset_history_v1'

export function getHistory(tipo: AssetEntry['tipo']): AssetEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const all: AssetEntry[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? '[]'
    )
    return all.filter((e) => e.tipo === tipo).slice(0, 10)
  } catch {
    return []
  }
}

export function addHistory(entry: AssetEntry) {
  if (typeof window === 'undefined') return
  try {
    const all: AssetEntry[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? '[]'
    )
    const deduped = [entry, ...all.filter((e) => e.url !== entry.url)]
    localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped.slice(0, 30)))
  } catch {}
}

export function removeHistory(url: string) {
  if (typeof window === 'undefined') return
  try {
    const all: AssetEntry[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? '[]'
    )
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(all.filter((e) => e.url !== url))
    )
  } catch {}
}

export function formatBytes(n?: number): string {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1_048_576).toFixed(1)} MB`
}

export function formatDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function isValidHex(v?: string): v is string {
  return !!v && /^#[0-9a-fA-F]{3,6}$/.test(v)
}
