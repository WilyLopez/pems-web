// ─── Public ───────────────────────────────────────────────────────────────────
export const PUBLIC_ROUTES = {
  home: '/',
  eventos: '/eventos',
  eventosPrivados: '/eventos-privados',
  reservar: '/reservar',
  reservarFecha: (fecha: string) => `/reservar/${fecha}`,
  nosotros: '/nosotros',
  promociones: '/promociones',
  zonaDeJuegos: '/zona-de-juegos',
  faq: '/faq',
  legal: (tipo: string) => `/legal/${tipo}`,
} as const

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  login: '/auth/login',
  registro: '/auth/registro',
} as const

// ─── Cliente ──────────────────────────────────────────────────────────────────
export const CLIENT_ROUTES = {
  miCuenta: '/cliente/mi-cuenta',
  misEntradas: '/cliente/mis-entradas',
  misEventos: '/cliente/mis-eventos',
  misEventosDetalle: (id: string | number) => `/cliente/mis-eventos/${id}`,
  misReservas: '/cliente/mis-reservas',
} as const

// ─── Admin ────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
  calendario: '/admin/calendario',
  reservas: '/admin/reservas',
  eventos: '/admin/eventos',
  eventoDetalle: (id: string | number) => `/admin/eventos/${id}`,
  ventas: '/admin/ventas',
  ventaNueva: '/admin/ventas/nueva',
  pagos: '/admin/pagos',
  comprobante: '/admin/comprobante',
  clientes: '/admin/clientes',
  inventario: '/admin/inventario',
  contratos: '/admin/contratos',
  contratoDetalle: (id: string | number) => `/admin/contratos/${id}`,
  proveedores: '/admin/proveedores',
  promociones: '/admin/promociones',
  usuarios: '/admin/usuarios',
  perfil: '/admin/perfil',
  configuracion: '/admin/configuracion',
  auditoria: '/admin/auditoria',
  tarifas: '/admin/comercial/tarifas',
  cms: '/admin/cms',
  cmsBanners: '/admin/cms/banners',
  cmsGaleria: '/admin/cms/galeria',
  cmsFaq: '/admin/cms/faq',
  cmsResenas: '/admin/cms/resenas',
  cmsLegal: '/admin/cms/legal',
  cmsConfiguracion: '/admin/cms/configuracion-publica',
} as const

// ─── Rutas protegidas por rol ─────────────────────────────────────────────────
export const PROTECTED_ROUTES = {
  admin: '/admin',
  cliente: '/cliente',
} as const
