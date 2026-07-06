'use client'

import Link from 'next/link'
import { Clock, Phone, Mail, MessageCircle } from 'lucide-react'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'
import { ContenidoLegalResumen } from '@/types/legal.types'
import { useHorarioAtencion } from '@/features/public/shared/hooks/useHorarioAtencion'
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/components/icons/SocialIcons'

interface DynamicFooterProps {
  config?: ConfiguracionPublica | null
  legalDocs?: ContenidoLegalResumen[]
}

const SERVICES_LINKS = [
  { href: '/juegos', label: 'Zona de Juegos' },
  { href: '/celebraciones', label: 'Celebraciones Privadas' },
  { href: '/celebraciones', label: 'Cumpleaños' },
  { href: '/celebraciones', label: 'Baby Shower' },
  { href: '/celebraciones', label: 'Eventos Temáticos' },
]

export function DynamicFooter({ config, legalDocs }: DynamicFooterProps) {
  const {
    horarioSemana: horarioSemanaOperacion,
    horarioFinDeSemana: horarioFinDeSemanaOperacion,
  } = useHorarioAtencion()

  const nombre = config?.nombreNegocio ?? 'Kiki y Lala'
  const slogan =
    config?.slogan ?? 'El espacio de diversión favorito de los niños.'
  const whatsapp = config?.whatsapp?.replace(/\D/g, '')
  const telefono = config?.telefono
  const correo = config?.correo
  const horarioSemana = horarioSemanaOperacion ?? 'Lun–Vie: 10am – 8pm'
  const horarioFinDeSemana = horarioFinDeSemanaOperacion ?? 'Sáb–Dom: 9am – 9pm'
  const tiktokUrl = config?.tiktokUrl

  const infoLinks = [
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/nosotros#faq', label: 'Preguntas Frecuentes' },
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
                  <FacebookIcon className="h-4 w-4" />
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
                  <InstagramIcon className="h-4 w-4" />
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
                  <TiktokIcon className="h-4 w-4" />
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
                  <YoutubeIcon className="h-4 w-4" />
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
