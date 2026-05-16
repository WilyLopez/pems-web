import { Metadata } from 'next'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'

const DEFAULT_TITLE = 'Kiki y Lala'
const DEFAULT_DESCRIPTION =
  'El espacio de diversión favorito de los niños en Chiclayo.'
const DEFAULT_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kikiylala.com'

interface SeoOptions {
  title?: string
  description?: string
  keywords?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function buildMetadata(
  options: SeoOptions = {},
  config?: ConfiguracionPublica
): Metadata {
  const siteName = config?.nombreNegocio ?? DEFAULT_TITLE
  const baseTitle = options.title
    ? `${options.title} | ${siteName}`
    : (config?.metaTitulo ?? siteName)

  const description =
    options.description ?? config?.metaDescripcion ?? DEFAULT_DESCRIPTION

  const keywords = options.keywords ?? config?.metaKeywords

  const url = options.path ? `${DEFAULT_URL}${options.path}` : DEFAULT_URL

  return {
    title: baseTitle,
    description,
    ...(keywords ? { keywords } : {}),
    metadataBase: new URL(DEFAULT_URL),
    openGraph: {
      title: baseTitle,
      description,
      url,
      siteName,
      type: 'website',
      ...(options.image ? { images: [{ url: options.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description,
      ...(options.image ? { images: [options.image] } : {}),
    },
    ...(options.noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: url,
    },
  }
}

export function buildPageTitle(
  pageTitle: string,
  config?: ConfiguracionPublica
): string {
  const siteName = config?.nombreNegocio ?? DEFAULT_TITLE
  return `${pageTitle} | ${siteName}`
}
