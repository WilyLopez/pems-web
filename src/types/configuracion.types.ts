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
  direccion: string
  ciudad: string
  departamento: string
  telefono: string | null
  correo: string | null
  ruc: string | null
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

export type ActualizarConfiguracionCalendarioRequest = Omit<ConfiguracionCalendario, 'idSede'>

export type ConfiguracionMap = Record<string, string>
