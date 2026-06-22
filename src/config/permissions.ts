export type Rol = 'ADMIN' | 'CLIENTE'

export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE',
} as const

export const PERMISSIONS: Record<string, Rol[]> = {
  dashboard: ['ADMIN'],
  usuarios: ['ADMIN'],
  configuracion: ['ADMIN'],
  auditoria: ['ADMIN'],
  cms: ['ADMIN'],
  ventas: ['ADMIN'],
  pagos: ['ADMIN'],
  contratos: ['ADMIN'],
  proveedores: ['ADMIN'],
  promociones: ['ADMIN'],
  inventario: ['ADMIN'],
  clientes: ['ADMIN'],
  reservas: ['ADMIN'],
  eventos: ['ADMIN'],
  calendario: ['ADMIN'],
}

export function hasPermission(rol: Rol, seccion: string): boolean {
  return PERMISSIONS[seccion]?.includes(rol) ?? false
}
