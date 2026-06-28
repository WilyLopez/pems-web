export interface ConfiguracionSistema {
  id: number
  clave: string
  valor: string
  descripcion: string | null
  tipo: 'TEXTO' | 'NUMERO' | 'BOOLEANO' | 'JSON'
  fechaActualizacion: string
}

export interface Sede {
  id: number
  nombre: string
  ciudad: string
  departamento: string
  ruc: string | null
  latitud: number | null
  longitud: number | null
  activo: boolean
  fechaCreacion: string
}

export interface ConfiguracionCalendario {
  idSede: number
  diasMinReservaPublica: number
  diasMaxReservaPublica: number
  diasMinEventoPrivado: number
  diasMaxEventoPrivado: number
  aforoMaximo: number
  horaApertura: string
  horaCierre: string
  turnoT1Inicio: string
  turnoT1Fin: string
  turnoT2Inicio: string
  turnoT2Fin: string
  diasOperacion: string
  rangoMaxBloqueo: number
}

export type ActualizarConfiguracionCalendarioRequest = Omit<
  ConfiguracionCalendario,
  'idSede'
>

export type ConfiguracionMap = Record<string, string>
