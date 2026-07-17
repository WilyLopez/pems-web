export const COMERCIAL_QUERY_KEYS = {
  tiposEventoAdmin: () => ['tipos-evento', 'admin'],
  tiposEventoPublico: () => ['tipos-evento', 'publico'],
  paquetesAdmin: () => ['paquetes', 'admin'],
  paquetesPublico: () => ['paquetes', 'publico'],
  beneficiosPaquete: (idPaquete?: number) => [
    'paquetes',
    idPaquete,
    'beneficios',
  ],
  categoriasServicioAdmin: () => ['categorias-servicio', 'admin'],
  categoriasServicioPublico: () => ['categorias-servicio', 'publico'],
  serviciosCotizacionAdmin: () => ['servicios-cotizacion', 'admin'],
  servicioVariantes: (idServicio?: number) => [
    'servicios-cotizacion',
    idServicio,
    'variantes',
  ],
  servicioImagenes: (idServicio?: number) => [
    'servicios-cotizacion',
    idServicio,
    'imagenes',
  ],
  tarifasActivas: (idSede: number | null) => ['tarifas-activas', idSede],
  preciosPublicos: (idSede: number) => ['precios-publicos', idSede],
} as const
