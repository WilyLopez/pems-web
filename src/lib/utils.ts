import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format as fnsFormat, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern?: string) {
  if (!date) return ''

  // Siempre parseamos a Date usando parseISO si es string para evitar desfases de zona horaria
  const d = typeof date === 'string' ? parseISO(date) : date

  if (pattern) {
    return fnsFormat(d, pattern, { locale: es })
  }

  // Para el formato por defecto, usamos Intl pero asegurando que no haya shift de UTC
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC', // Forzamos UTC ya que parseISO para YYYY-MM-DD sin tiempo genera medianoche UTC en muchos entornos
  })
}

export function formatDateTime(date: string | Date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatCurrency(amount: number, decimals?: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function getInitials(name: string) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Converts an absolute backend file URL to a root-relative path so it goes
 * through the Next.js rewrite proxy (/files/** → backend/files/**).
 * Already-relative URLs and null/undefined are returned as-is.
 */
export function exportarCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function fileUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('/files/')) return url
  const backendOrigin = process.env.NEXT_PUBLIC_API_URL!.replace(
    /\/api\/v1\/?$/,
    ''
  )
  if (url.startsWith(backendOrigin)) {
    return url.slice(backendOrigin.length)
  }
  if (url.startsWith('/')) return '/files' + url
  return url
}
