export interface Faq {
  id: number
  pregunta: string
  respuesta: string
  ordenVisualizacion: number
  visible: boolean
  fechaActualizacion?: string
}

export interface CrearFaqPayload {
  pregunta: string
  respuesta: string
  ordenVisualizacion?: number
  visible?: boolean
}

export interface ActualizarFaqPayload extends CrearFaqPayload {}

export interface ReordenarFaqsPayload {
  ids: number[]
}
