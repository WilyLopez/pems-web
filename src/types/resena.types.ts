export interface Resena {
  id: number
  nombreAutor: string
  contenido: string
  calificacion: number
  aprobada: boolean
  fotoUrl?: string
  respuestaAdmin?: string
  fechaRespuesta?: string
  destacada: boolean
  mostrarHome: boolean
  fechaCreacion: string
}

export interface SubmitResenaPayload {
  idEventoPrivado?: number
  nombreAutor: string
  contenido: string
  calificacion: number
  fotoUrl?: string
}

export interface ResponderResenaPayload {
  respuesta: string
}
