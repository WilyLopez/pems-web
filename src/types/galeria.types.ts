export interface ImagenGaleria {
  id: number
  idSede?: number
  url: string
  titulo?: string
  descripcion?: string
  tipoMime?: string
  tamanioBytes?: number
  destacada: boolean
  eliminada: boolean
  orden?: number
  fechaCreacion?: string
}

export interface SubirImagenGaleriaPayload {
  titulo?: string
  descripcion?: string
}

export interface ActualizarImagenGaleriaPayload {
  titulo?: string
  descripcion?: string
  destacada?: boolean
  orden?: number
}
