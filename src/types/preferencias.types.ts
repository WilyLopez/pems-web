//src/types/preferencias.types.ts

export type TemaAdmin = 'LIGHT' | 'DARK' | 'SYSTEM'
export type TamanioFuente = 'SMALL' | 'NORMAL' | 'LARGE'
export type RadiosBordes = 'SMALL' | 'NORMAL' | 'LARGE'
export type AnchoContenido = 'BOXED' | 'FULL'
export type PrimerDiaSemana = 'SUNDAY' | 'MONDAY'

export interface PreferenciaAdmin {
  id: string
  idUsuarioAdmin: string

  // Apariencia
  tema: TemaAdmin
  colorPrimario: string | null
  colorSecundario: string | null
  colorSidebar: string | null
  colorAcento: string | null
  tipografia: string
  tamanioFuente: TamanioFuente
  radiosBordes: RadiosBordes

  // Layout
  sidebarColapsado: boolean
  sidebarFlotante: boolean
  modoCompacto: boolean
  anchoContenido: AnchoContenido
  mostrarMigaspan: boolean
  mostrarIconosMenu: boolean

  // Animaciones
  mostrarAnimaciones: boolean
  animacionSidebar: boolean
  hoverEffects: boolean
  loadersAnimados: boolean

  // Comportamiento
  confirmarAcciones: boolean
  recordarUltimaPagina: boolean
  restaurarTabs: boolean
  autoRefreshDashboard: boolean
  intervaloRefreshSeg: number

  // Dashboard (JSONB → parsed objects)
  dashboardPersonalizado: unknown | null
  widgetsVisibles: unknown | null
  accesosRapidos: unknown | null
  ordenWidgets: unknown | null
  layoutDashboard: unknown | null

  // Tablas
  filtrosPersistentes: unknown | null
  columnasVisibles: unknown | null
  ordenamientoTablas: unknown | null
  elementosPorTabla: number

  // Notificaciones
  sonidoNotificaciones: boolean
  notificacionesPush: boolean
  notificacionesEmail: boolean
  notificacionesVisuales: boolean
  badgesDinamicos: boolean

  // Localización
  idioma: string
  zonaHoraria: string
  formatoFecha: string
  formatoHora: string
  primerDiaSemana: PrimerDiaSemana

  // Accesibilidad
  altoContraste: boolean
  reducirAnimaciones: boolean
  aumentarEspaciado: boolean
  cursorGrande: boolean

  fechaCreacion: string
  fechaActualizacion: string
}

export type UpdatePreferenciaPayload = Omit<
  PreferenciaAdmin,
  'id' | 'idUsuarioAdmin' | 'fechaCreacion' | 'fechaActualizacion'
>

export type PatchPreferenciaPayload = Partial<UpdatePreferenciaPayload>
