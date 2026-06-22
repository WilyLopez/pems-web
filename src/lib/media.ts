import { CarpetaMedia, mediaService } from '@/services/media.service'
import { MediaValue } from '@/types/media.types'

export function fixMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (
    url.startsWith('http') ||
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('/')
  ) return url
  const base = process.env.NEXT_PUBLIC_API_URL?.split('/api/')[0] ?? ''
  return `${base}/${url}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function resolverMediaValue(
  value: MediaValue | null,
  carpeta: CarpetaMedia
): Promise<string | null> {
  if (!value) return null
  if (!value.esLocal) return value.url
  if (!value.file) return null
  const response = await mediaService.upload(value.file, carpeta)
  URL.revokeObjectURL(value.url)
  return response.url
}

export async function resolverMediaValues(
  values: MediaValue[],
  carpeta: CarpetaMedia
): Promise<string[]> {
  const urls: string[] = []
  for (const v of values) {
    const url = await resolverMediaValue(v, carpeta)
    if (url) urls.push(url)
  }
  return urls
}
