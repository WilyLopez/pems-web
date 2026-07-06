interface GaleriaFiltros {
  page?: number
  size?: number
  soloDestacadas?: boolean
  categoria?: string
}

interface GaleriaFiltrosPublicos {
  soloDestacadas?: boolean
  categoria?: string
}

export const CMS_QUERY_KEYS = {
  banners: (page: number, size: number) => ['banners', 'admin', page, size],
  configuracionAdmin: () => ['configuracion-publica', 'admin'],
  contenidoWeb: (seccion?: string, search?: string, page?: number) => [
    'contenido-web',
    'admin',
    seccion,
    search,
    page,
  ],
  seccionesWeb: () => ['secciones-web'],
  faqAdmin: () => ['faqs', 'admin'],
  galeria: {
    all: ['galeria'] as const,
    lista: (filtros: GaleriaFiltros) => ['galeria', 'admin', filtros] as const,
    infinita: (filtros: GaleriaFiltros) =>
      ['galeria', 'admin', 'infinita', filtros] as const,
    detalle: (id: number) => ['galeria', 'admin', 'detalle', id] as const,
  },
  galeriaPublica: (filtros: GaleriaFiltrosPublicos) =>
    ['galeria', 'publica', filtros] as const,
  legalDocumentos: () => ['legal-documentos', 'admin'],
  resenasPendientes: (page: number, size: number) => [
    'resenas',
    'pendientes',
    page,
    size,
  ],
  resenasTodas: (page: number, size: number) => [
    'resenas',
    'todas',
    page,
    size,
  ],

  // Movidos desde comercial
  zonasAdmin: () => ['zonas', 'admin'],
  actividadesAdmin: () => ['actividades', 'admin'],
  novedadesAdmin: () => ['novedades', 'admin'],
} as const
