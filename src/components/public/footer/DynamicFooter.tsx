import Link from 'next/link'
import { MapPin, Clock, Phone, Mail, MessageCircle } from 'lucide-react'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'
import { ContenidoLegalResumen } from '@/types/legal.types'

interface DynamicFooterProps {
  config?: ConfiguracionPublica | null
  legalDocs?: ContenidoLegalResumen[]
}

const SERVICES_LINKS = [
  { href: '/zona-de-juegos', label: 'Zona de Juegos' },
  { href: '/celebraciones', label: 'Celebraciones Privadas' },
  { href: '/celebraciones', label: 'Cumpleaños' },
  { href: '/celebraciones', label: 'Baby Shower' },
  { href: '/celebraciones', label: 'Eventos Temáticos' },
]

export function DynamicFooter({ config, legalDocs }: DynamicFooterProps) {
  const nombre = config?.nombreNegocio ?? 'Kiki y Lala'
  const slogan =
    config?.slogan ?? 'El espacio de diversión favorito de los niños.'
  const whatsapp = config?.whatsapp?.replace(/\D/g, '')
  const telefono = config?.telefono
  const correo = config?.correo
  const direccion = config?.direccion
  const horarioSemana = config?.horarioSemana ?? 'Lun–Vie: 10am – 8pm'
  const horarioFinDeSemana = config?.horarioFinDeSemana ?? 'Sáb–Dom: 9am – 9pm'
  const tiktokUrl = config?.tiktokUrl

  const infoLinks = [
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/faq', label: 'Preguntas Frecuentes' },
    ...(legalDocs ?? [])
      .filter((doc) => doc.visibleFooter)
      .map((doc) => ({
        href: `/legal/${doc.slug}`,
        label: doc.etiqueta,
      })),
  ]

  const rawCopyright =
    config?.copyrightTexto ?? '© {year} {name} · Todos los derechos reservados'
  const copyright = rawCopyright
    .replace('{year}', new Date().getFullYear().toString())
    .replace('{name}', nombre)

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <span className="font-black text-xl tracking-tight">{nombre}</span>
            <p className="text-sm text-gray-400 leading-relaxed">{slogan}</p>
            <div className="flex gap-3 pt-1">
              {config?.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-azul flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {config?.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-rosa flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="0.5"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.85a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1-.23z" />
                  </svg>
                </a>
              )}
              {config?.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                  </svg>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {SERVICES_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-brand-azul transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Información</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {infoLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-brand-azul transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {direccion && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-azul" />
                  <span>{direccion}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-brand-rosa" />
                <span>
                  {horarioSemana}
                  <br />
                  {horarioFinDeSemana}
                </span>
              </li>
              {telefono && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-brand-azul" />
                  {whatsapp ? (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-azul transition-colors"
                    >
                      {telefono}
                    </a>
                  ) : (
                    <span>{telefono}</span>
                  )}
                </li>
              )}
              {correo && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-brand-rosa" />
                  <a
                    href={`mailto:${correo}`}
                    className="hover:text-brand-azul transition-colors break-all"
                  >
                    {correo}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>{copyright}</p>
          <p>Hecho con dedicación para las familias del Perú</p>
        </div>
      </div>
    </footer>
  )
}
