import Link from 'next/link'
import {
  Package,
  Tag,
  MapPin,
  Zap,
  Newspaper,
  Wrench,
  DollarSign,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

const SECCIONES = [
  {
    href: '/admin/comercial/paquetes',
    icon: Package,
    titulo: 'Paquetes',
    descripcion: 'Crea y gestiona paquetes de eventos y celebraciones',
    color: 'bg-brand-azul/10 text-brand-azul',
    accent: 'group-hover:bg-brand-azul/20',
  },
  {
    href: '/admin/comercial/paquetes/tipos-evento',
    icon: Tag,
    titulo: 'Tipos de Evento',
    descripcion: 'Clasifica los tipos de evento disponibles en el sistema',
    color: 'bg-brand-rosa/10 text-brand-rosa',
    accent: 'group-hover:bg-brand-rosa/20',
  },
  {
    href: '/admin/comercial/zonas',
    icon: MapPin,
    titulo: 'Zonas',
    descripcion: 'Administra las zonas y áreas del espacio de eventos',
    color: 'bg-brand-menta/20 text-emerald-700',
    accent: 'group-hover:bg-brand-menta/30',
  },
  {
    href: '/admin/comercial/actividades',
    icon: Zap,
    titulo: 'Actividades',
    descripcion: 'Gestiona las actividades y atracciones disponibles',
    color: 'bg-brand-amarillo/20 text-amber-700',
    accent: 'group-hover:bg-brand-amarillo/30',
  },
  {
    href: '/admin/comercial/novedades',
    icon: Newspaper,
    titulo: 'Novedades',
    descripcion: 'Publica noticias, promociones y novedades del negocio',
    color: 'bg-purple-100 text-purple-700',
    accent: 'group-hover:bg-purple-200',
  },
  {
    href: '/admin/comercial/servicios',
    icon: Wrench,
    titulo: 'Servicios',
    descripcion: 'Configura los servicios de cotización disponibles',
    color: 'bg-sky-100 text-sky-700',
    accent: 'group-hover:bg-sky-200',
  },
  {
    href: '/admin/comercial/tarifas',
    icon: DollarSign,
    titulo: 'Tarifas',
    descripcion: 'Define las tarifas y precios de entradas y servicios',
    color: 'bg-orange-100 text-orange-700',
    accent: 'group-hover:bg-orange-200',
  },
]

export default function ComercialPage() {
  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Comercial' }]} />

      <PageHeader
        title="Gestión Comercial"
        description="Administra paquetes, zonas, actividades, tarifas y todo el catálogo de servicios"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map(
          ({ href, icon: Icon, titulo, descripcion, color, accent }) => (
            <Link key={href} href={href} className="group">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md hover:border-gray-200 transition-all">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${color} ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 group-hover:text-brand-azul transition-colors">
                    {titulo}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                    {descripcion}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-azul shrink-0 mt-1 transition-colors" />
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  )
}
