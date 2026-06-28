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
  serviciosCotizacionAdmin: () => ['servicios-cotizacion', 'admin'],
  tarifasActivas: (idSede: number | null) => ['tarifas-activas', idSede],
  preciosPublicos: (idSede: number) => ['precios-publicos', idSede],
} as const
