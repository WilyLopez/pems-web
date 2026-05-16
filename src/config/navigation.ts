import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  CreditCard,
  Users,
  Package,
  FileText,
  Truck,
  Megaphone,
  UserCog,
  Settings,
  ClipboardList,
  BarChart3,
  Home,
  Ticket,
  Star,
  BookOpen,
  Image,
  HelpCircle,
} from 'lucide-react'
import { ADMIN_ROUTES, CLIENT_ROUTES, PUBLIC_ROUTES } from './routes'

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

// ─── Navegación pública ────────────────────────────────────────────────────────
export const publicNav: NavItem[] = [
  { label: 'Inicio', href: PUBLIC_ROUTES.home },
  { label: 'Zona de Juegos', href: PUBLIC_ROUTES.zonaDeJuegos },
  { label: 'Eventos', href: PUBLIC_ROUTES.eventos },
  { label: 'Reservar', href: PUBLIC_ROUTES.reservar },
  { label: 'Promociones', href: PUBLIC_ROUTES.promociones },
  { label: 'Nosotros', href: PUBLIC_ROUTES.nosotros },
]

// ─── Navegación cliente ────────────────────────────────────────────────────────
export const clientNav: NavItem[] = [
  { label: 'Mi Cuenta', href: CLIENT_ROUTES.miCuenta, icon: UserCog },
  { label: 'Mis Reservas', href: CLIENT_ROUTES.misReservas, icon: Calendar },
  { label: 'Mis Eventos', href: CLIENT_ROUTES.misEventos, icon: Star },
  { label: 'Mis Entradas', href: CLIENT_ROUTES.misEntradas, icon: Ticket },
]

// ─── Navegación admin (sidebar) ───────────────────────────────────────────────
export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Calendario', href: ADMIN_ROUTES.calendario, icon: Calendar },
  { label: 'Reservas', href: ADMIN_ROUTES.reservas, icon: BookOpen },
  { label: 'Eventos', href: ADMIN_ROUTES.eventos, icon: Star },
  { label: 'Ventas', href: ADMIN_ROUTES.ventas, icon: ShoppingCart },
  { label: 'Pagos', href: ADMIN_ROUTES.pagos, icon: CreditCard },
  { label: 'Contratos', href: ADMIN_ROUTES.contratos, icon: FileText },
  { label: 'Clientes', href: ADMIN_ROUTES.clientes, icon: Users },
  { label: 'Inventario', href: ADMIN_ROUTES.inventario, icon: Package },
  { label: 'Proveedores', href: ADMIN_ROUTES.proveedores, icon: Truck },
  { label: 'Promociones', href: ADMIN_ROUTES.promociones, icon: Megaphone },
  { label: 'Usuarios', href: ADMIN_ROUTES.usuarios, icon: UserCog },
  {
    label: 'CMS',
    href: ADMIN_ROUTES.cms,
    icon: Image,
    children: [
      { label: 'Banners', href: ADMIN_ROUTES.cmsBanners },
      { label: 'Galería', href: ADMIN_ROUTES.cmsGaleria },
      { label: 'FAQ', href: ADMIN_ROUTES.cmsFaq },
      { label: 'Reseñas', href: ADMIN_ROUTES.cmsResenas },
      { label: 'Legal', href: ADMIN_ROUTES.cmsLegal },
      { label: 'Configuración', href: ADMIN_ROUTES.cmsConfiguracion },
    ],
  },
  { label: 'Configuración', href: ADMIN_ROUTES.configuracion, icon: Settings },
  { label: 'Auditoría', href: ADMIN_ROUTES.auditoria, icon: BarChart3 },
]
