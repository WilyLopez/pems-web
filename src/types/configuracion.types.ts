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

export type ConfiguracionMap = Record<string, string>
