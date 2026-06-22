export type BlockTipo = 'heading' | 'paragraph' | 'image' | 'button' | 'divider'

export interface EmailBlock {
  id: string
  tipo: BlockTipo
  texto?: string
  url?: string
  alt?: string
  nivel?: 1 | 2
}

export const VARIABLES_MARKETING: {
  nombre: string
  descripcion: string
  ejemplo: string
}[] = [
  { nombre: 'nombreCliente',  descripcion: 'Nombre completo del cliente',      ejemplo: 'María García' },
  { nombre: 'nombreNegocio',  descripcion: 'Nombre del local',                 ejemplo: 'Kiki y Lala' },
  { nombre: 'promocion',      descripcion: 'Nombre de la promoción',           ejemplo: 'Pack Cumpleaños Especial' },
  { nombre: 'descuento',      descripcion: 'Porcentaje o valor del descuento', ejemplo: '20%' },
  { nombre: 'fechaVigencia',  descripcion: 'Fecha límite de la oferta',        ejemplo: '30/06/2026' },
  { nombre: 'urlReserva',     descripcion: 'Enlace para reservar',             ejemplo: 'https://kikililala.com/reservar' },
  { nombre: 'mes',            descripcion: 'Mes actual en texto',              ejemplo: 'Junio' },
  { nombre: 'anio',           descripcion: 'Año actual',                       ejemplo: '2026' },
  { nombre: 'nombreNino',     descripcion: 'Nombre del niño registrado',       ejemplo: 'Lucía' },
  { nombre: 'ultimaVisita',   descripcion: 'Fecha de la última visita',        ejemplo: '15/01/2026' },
]

export const VARIABLES_BLOQUEADAS = [
  'qrUrl', 'codigoTicket', 'montoPago', 'reembolso', 'codigoReserva',
  'fechaEvento', 'cantidadNinos', 'referencia', 'idCliente', 'idReserva',
]

export function serializarBloques(bloques: EmailBlock[]): string {
  return JSON.stringify(bloques)
}

export function parsearBloques(json: string | null | undefined): EmailBlock[] {
  if (!json) return []
  try {
    return JSON.parse(json) as EmailBlock[]
  } catch {
    return []
  }
}

export function bloquesContienenVariablesBloqueadas(bloques: EmailBlock[]): string | null {
  const VAR_RE = /\{\{(\w+)\}\}/g
  for (const bloque of bloques) {
    const textos = [bloque.texto, bloque.url].filter(Boolean) as string[]
    for (const texto of textos) {
      let m: RegExpExecArray | null
      while ((m = VAR_RE.exec(texto)) !== null) {
        if (VARIABLES_BLOQUEADAS.includes(m[1])) return m[1]
      }
    }
  }
  return null
}
