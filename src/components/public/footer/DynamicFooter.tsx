import Link from 'next/link'
import {
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
} from 'lucide-react'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'

interface DynamicFooterProps {
  config?: ConfiguracionPublica | null
}

const QUICK_LINKS = [
  { href: '/zona-de-juegos', label: 'Zona de Juegos' },
  { href: '/eventos', label: 'Eventos Privados' },
  { href: '/eventos', label: 'Cumpleaños' },
  { href: '/eventos', label: 'Baby Shower' },
  { href: '/eventos', label: 'Eventos Temáticos' },
]

const INFO_LINKS = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/faq', label: 'Preguntas Frecuentes' },
  { href: '/nosotros', label: 'Reglamento' },
  { href: '/legal/privacidad', label: 'Política de Privacidad' },
  { href: '/legal/terminos', label: 'Términos y Condiciones' },
]

export function DynamicFooter({ config }: DynamicFooterProps) {
  const nombre = config?.nombreNegocio ?? 'Kiki y Lala'
  const descripcion =
    config?.slogan ??
    'El espacio de diversión favorito de los niños en Chiclayo.'
  const whatsapp = config?.whatsapp ?? '51999999999'
  const telefono = config?.telefonoPrincipal
  const direccion = config?.direccion
  const ciudad = config?.ciudad
  const horarioLV = config?.horarioLunesViernes ?? 'Lun–Vie: 10am – 8pm'
  const horarioSD =
    config?.horarioSabado && config?.horarioDomingo
      ? `Sáb–Dom: ${config.horarioSabado}`
      : 'Sáb–Dom: 9am – 9pm'

  const facebookUrl = config?.facebookUrl
  const instagramUrl = config?.instagramUrl
  const tiktokUrl = config?.tiktokUrl
  const youtubeUrl = config?.youtubeUrl

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight">
                {nombre}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {descripcion}
            </p>

            {/* Redes sociales */}
            <div className="flex gap-3 pt-1">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-azul flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-rosa flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
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

          {/* Servicios */}
          <div>
            <h4 className="font-bold mb-4 text-white">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {QUICK_LINKS.map(({ href, label }) => (
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

          {/* Información */}
          <div>
            <h4 className="font-bold mb-4 text-white">Información</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {INFO_LINKS.map(({ href, label }) => (
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

          {/* Contacto */}
          <div>
            <h4 className="font-bold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {(direccion || ciudad) && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-azul" />
                  <span>{[direccion, ciudad].filter(Boolean).join(', ')}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-brand-rosa" />
                <span>
                  {horarioLV}
                  <br />
                  {horarioSD}
                </span>
              </li>
              {telefono && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-brand-menta" />
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    className="hover:text-brand-azul transition-colors"
                  >
                    {telefono}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {nombre} &middot; Todos los
            derechos reservados
          </p>
          <p>Hecho con dedicación para las familias del Perú</p>
        </div>
      </div>
    </footer>
  )
}
