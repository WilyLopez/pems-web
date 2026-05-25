import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
export function fileUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const backendOrigin = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'
  ).replace(/\/api\/v1\/?$/, '')
  if (url.startsWith(backendOrigin + '/files/')) {
    return url.slice(backendOrigin.length)
  }
  return url
}
