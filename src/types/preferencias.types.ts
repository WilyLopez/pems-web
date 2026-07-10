//src/types/preferencias.types.ts

export type TemaAdmin = 'LIGHT' | 'DARK' | 'SYSTEM'
export type TamanioFuente = 'SMALL' | 'NORMAL' | 'LARGE'

export interface PreferenciaAdmin {
  id: string
  idUsuarioAdmin: string

  tema: TemaAdmin
  tipografia: string
  tamanioFuente: TamanioFuente

  sonidoNotificaciones: boolean
  notificacionesPush: boolean
  notificacionesEmail: boolean
  notificacionesVisuales: boolean
  badgesDinamicos: boolean

  fechaCreacion: string
  fechaActualizacion: string
}

export type UpdatePreferenciaPayload = Omit<
  PreferenciaAdmin,
  'id' | 'idUsuarioAdmin' | 'fechaCreacion' | 'fechaActualizacion'
>

export type PatchPreferenciaPayload = Partial<UpdatePreferenciaPayload>
