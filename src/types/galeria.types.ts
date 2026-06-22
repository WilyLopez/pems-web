export interface ImagenGaleria {
  id: number
  idSede?: number
  url: string
  titulo?: string
  descripcion?: string
  altTexto?: string
  categoria?: string
  tipoMime?: string
  tamanioBytes?: number
  destacada: boolean
  orden: number
  fechaCreacion?: string
}

export interface ActualizarImagenGaleriaPayload {
  titulo?: string
  descripcion?: string
  altTexto?: string
  categoria?: string
  orden?: number
}
