export const LABEL_ROL: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
  CLIENTE: 'Cliente',
}

export function getDashboardUrl(roles: string[], tipoPerfil: string | null): string {
  if (tipoPerfil === 'CLIENTE') return '/cliente'
  if (tipoPerfil === 'STAFF') {
    if (roles.includes('CAJERO') && !roles.includes('ADMIN') && !roles.includes('SUPERADMIN')) {
      return '/admin/ventas'
    }
    return '/admin/dashboard'
  }
  return '/auth/login'
}

export function getRolPrincipal(roles: string[]): string {
  if (roles.includes('SUPERADMIN')) return 'SUPERADMIN'
  if (roles.includes('ADMIN')) return 'ADMIN'
  if (roles.includes('CAJERO')) return 'CAJERO'
  if (roles.includes('CLIENTE')) return 'CLIENTE'
  return 'DESCONOCIDO'
}

export const COOKIE_TIPO_PERFIL = 'x-tipo-perfil'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7
