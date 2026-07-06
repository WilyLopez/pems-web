import {
  MAX_TAMANIO_BYTES,
  MAX_TAMANIO_MB,
  TIPOS_PERMITIDOS,
} from '../constants/upload'

export function claveArchivo(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export function nombreBase(nombreArchivo: string): string {
  const punto = nombreArchivo.lastIndexOf('.')
  return punto > 0 ? nombreArchivo.slice(0, punto) : nombreArchivo
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugImagen(imagen: { id: number; titulo?: string }): string {
  const base = imagen.titulo?.trim() ? slugify(imagen.titulo) : ''
  return base ? `${base}-${imagen.id}` : String(imagen.id)
}

export function idDesdeSlug(slug: string): number {
  const ultimo = slug.split('-').pop() ?? ''
  return Number(ultimo)
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validarArchivo(file: File): string | null {
  if (!(TIPOS_PERMITIDOS as readonly string[]).includes(file.type)) {
    return 'Formato no permitido'
  }
  if (file.size > MAX_TAMANIO_BYTES) {
    return `Supera el máximo de ${MAX_TAMANIO_MB} MB`
  }
  return null
}

export function particionarArchivos(files: File[]): {
  validos: File[]
  rechazados: File[]
} {
  const validos: File[] = []
  const rechazados: File[] = []
  for (const file of files) {
    if (validarArchivo(file) === null) validos.push(file)
    else rechazados.push(file)
  }
  return { validos, rechazados }
}
