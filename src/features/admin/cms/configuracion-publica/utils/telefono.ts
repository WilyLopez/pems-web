const PREFIJO_PERU = '51'

export function soloDigitos(valor?: string): string {
  return (valor ?? '').replace(/\D/g, '')
}

export function formatearTelefono(valor?: string): string {
  const digitos = soloDigitos(valor).slice(0, 9)
  return digitos.match(/.{1,3}/g)?.join(' ') ?? digitos
}

export function ultimosNueveDigitos(valor?: string): string {
  return soloDigitos(valor).slice(-9)
}

export function formatearParaMostrar(valor?: string): string {
  return formatearTelefono(ultimosNueveDigitos(valor))
}

export function aWhatsappInternacional(valor?: string): string {
  const digitos = ultimosNueveDigitos(valor)
  return digitos ? `${PREFIJO_PERU}${digitos}` : ''
}

export function telefonoValido(valor?: string): boolean {
  const v = valor ?? ''
  return !v || soloDigitos(v).length === 9
}
