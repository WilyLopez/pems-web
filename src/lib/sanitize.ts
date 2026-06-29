import DOMPurify from 'isomorphic-dompurify'

export function sanitizeLegalHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
