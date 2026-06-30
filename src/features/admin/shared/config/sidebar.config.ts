import {
  LayoutDashboard,
  Calendar,
  Ticket,
  PartyPopper,
  Tag,
  Mail,
  Users,
  Globe,
  ClipboardList,
  UserCog,
  ScanLine,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Landmark,
  HeadphonesIcon,
  Settings,
  Package2,
  MapPin,
  Zap,
  Newspaper,
  DollarSign,
  LayoutGrid,
  ImageIcon,
  Images,
  FileText,
  HelpCircle,
  Scale,
  Star,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavLeaf = {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

export type NavAccordionItem = {
  label: string
  icon: LucideIcon
  children: NavLeaf[]
}

export type NavGroupItem = NavLeaf | NavAccordionItem

export const navGroups: {
  label: string
  items: NavGroupItem[]
}[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Calendario', href: '/admin/calendario', icon: Calendar },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Reservas', href: '/admin/reservas', icon: Ticket },
      { label: 'Eventos privados', href: '/admin/eventos', icon: PartyPopper },
      { label: 'Accesos', href: '/admin/accesos', icon: ScanLine },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      {
        label: 'Resumen',
        href: '/admin/finanzas',
        icon: TrendingUp,
        exact: true,
      },
      { label: 'Ventas', href: '/admin/ventas', icon: DollarSign },
      { label: 'Caja', href: '/admin/finanzas/caja', icon: Landmark },
      {
        label: 'Ingresos',
        href: '/admin/finanzas/ingresos',
        icon: ArrowUpCircle,
      },
      {
        label: 'Egresos',
        href: '/admin/finanzas/egresos',
        icon: ArrowDownCircle,
      },
      { label: 'Reportes', href: '/admin/finanzas/reportes', icon: BarChart3 },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Paquetes', href: '/admin/comercial/paquetes', icon: Package2 },
      {
        label: 'Servicios',
        href: '/admin/comercial/servicios',
        icon: LayoutGrid,
      },
      { label: 'Tarifas', href: '/admin/comercial/tarifas', icon: DollarSign },
      { label: 'Promociones', href: '/admin/promociones', icon: Tag },
    ],
  },
  {
    label: 'Sitio web',
    items: [
      {
        label: 'CMS',
        icon: Globe,
        children: [
          {
            label: 'Inicio',
            href: '/admin/cms',
            icon: LayoutDashboard,
            exact: true,
          },
          { label: 'Zonas de juego', href: '/admin/cms/zonas', icon: MapPin },
          { label: 'Actividades', href: '/admin/cms/actividades', icon: Zap },
          { label: 'Novedades', href: '/admin/cms/novedades', icon: Newspaper },
          { label: 'Banners', href: '/admin/cms/banners', icon: ImageIcon },
          { label: 'Galería', href: '/admin/cms/galeria', icon: Images },
          { label: 'Contenido', href: '/admin/cms/contenido', icon: FileText },
          { label: 'FAQ', href: '/admin/cms/faq', icon: HelpCircle },
          { label: 'Legal', href: '/admin/cms/legal', icon: Scale },
          { label: 'Reseñas', href: '/admin/cms/resenas', icon: Star },
          {
            label: 'Config. pública',
            href: '/admin/cms/configuracion-publica',
            icon: SlidersHorizontal,
          },
        ],
      },
    ],
  },
  {
    label: 'Clientes',
    items: [
      { label: 'Clientes', href: '/admin/clientes', icon: Users },
      { label: 'Marketing', href: '/admin/marketing', icon: Mail },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Usuarios', href: '/admin/usuarios', icon: UserCog },
      { label: 'Auditoría', href: '/admin/auditoria', icon: ClipboardList },
      { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
      { label: 'Soporte', href: '/admin/soporte', icon: HeadphonesIcon },
    ],
  },
]
