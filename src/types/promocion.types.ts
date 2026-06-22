export interface Promocion {
  id: number
  tipoPromocion: string
  idSede?: number
  nombre: string
  descripcion?: string
  valorDescuento: number
  minimoPersonas?: number
  soloTipoDia?: string
  fechaInicio: string
  fechaFin?: string
  activo: boolean
  esAutomatica: boolean
  imagenUrl?: string
  bannerUrl?: string
  colorDestacado?: string
  textoPublicitario?: string
  textoBoton?: string
  urlBoton?: string
  mostrarEnInicio: boolean
  mostrarEnCarrusel: boolean
  mostrarEnPaginaPromociones: boolean
  mostrarEnCheckout: boolean
  soloMovil: boolean
  fechaCreacion?: string
}
