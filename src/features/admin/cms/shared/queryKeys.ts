export const CMS_QUERY_KEYS = {
  banners: (page: number, size: number) => ['banners', 'admin', page, size],
  configuracionAdmin: () => ['configuracion-publica', 'admin'],
  contenidoWeb: (seccion?: string, search?: string, page?: number) => ['contenido-web', 'admin', seccion, search, page],
  seccionesWeb: () => ['secciones-web'],
  faqAdmin: () => ['faqs', 'admin'],
  galeria: (page: number, size: number) => ['galeria', 'admin', page, size],
  legalDocumentos: () => ['legal-documentos', 'admin'],
  resenasPendientes: (page: number, size: number) => ['resenas', 'pendientes', page, size],
  resenasTodas: (page: number, size: number) => ['resenas', 'todas', page, size],
  
  // Movidos desde comercial
  zonasAdmin: () => ['zonas', 'admin'],
  actividadesAdmin: () => ['actividades', 'admin'],
  novedadesAdmin: () => ['novedades', 'admin'],
} as const
