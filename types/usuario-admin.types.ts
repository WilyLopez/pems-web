export type RolAdmin = 'GERENTE' | 'SUBGERENTE' | 'ADMINISTRATIVO'
export type EstadoAdmin = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'

export interface UsuarioAdmin {
  id: number
  idSede: number
  nombre: string
  correo: string
  rol: RolAdmin
  telefono?: string
  fotoPerfilUrl?: string
  activo: boolean
  debeCambiarContrasena: boolean
  intentosFallidos: number
  bloqueadoHasta?: string
  ultimoAcceso?: string
  fechaCreacion: string
}

export function getEstadoAdmin(u: UsuarioAdmin): EstadoAdmin {
  if (u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date()) return 'BLOQUEADO'
  return u.activo ? 'ACTIVO' : 'INACTIVO'
}
