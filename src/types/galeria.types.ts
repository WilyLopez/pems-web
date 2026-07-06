import type { CategoriaImagen } from '@/features/admin/cms/galeria/constants/categorias'

export interface ImagenGaleria {
  id: number
  idSede?: number
  url: string
  titulo?: string
  descripcion?: string
  altTexto?: string
  categoria?: CategoriaImagen
  tipoMime?: string
  tamanioBytes?: number
  destacada: boolean
  orden: number
  fechaCreacion?: string
}

export interface SubirImagenPayload {
  archivo: File
  categoria: CategoriaImagen
  titulo?: string
  descripcion?: string
  altTexto?: string
  orden?: number
}

export interface ActualizarImagenGaleriaPayload {
  titulo?: string
  descripcion?: string
  altTexto?: string
  categoria?: CategoriaImagen
  orden?: number
}
