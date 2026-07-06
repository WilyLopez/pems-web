export interface CampoBloque {
  clave: string
  label: string
  multilinea?: boolean
}

export interface ValorItem {
  titulo: string
  descripcion: string
}

export interface Bloque {
  id: string
  seccion: string
  titulo: string
  descripcion: string
  preview: string
  tipo?: 'campos' | 'lista' | 'lista-texto'
  campos?: CampoBloque[]
  claveTitulo?: string
  claveSubtitulo?: string
  claveItems?: string
  maxDescripcion?: number
  maxItem?: number
}

export const MAX_DESCRIPCION_VALOR = 250
export const MAX_LONGITUD_REGLA = 120

export const SECCIONES = [
  { codigo: 'HOME', nombre: 'Inicio' },
  { codigo: 'NOSOTROS', nombre: 'Nosotros' },
  { codigo: 'ZONA_JUEGOS', nombre: 'Zona de juegos' },
]

export const BLOQUES: Bloque[] = [
  {
    id: 'hero',
    seccion: 'HOME',
    titulo: 'Portada',
    descripcion: 'El primer bloque que ven los visitantes',
    preview: 'hero',
    campos: [
      { clave: 'home.hero.badge', label: 'Etiqueta superior' },
      { clave: 'home.hero.titulo_linea1', label: 'Título (línea 1)' },
      { clave: 'home.hero.titulo_linea2', label: 'Título (línea 2, en color)' },
      { clave: 'home.hero.parrafo', label: 'Descripción', multilinea: true },
    ],
  },
  {
    id: 'hero-stats',
    seccion: 'HOME',
    titulo: 'Estadísticas de portada',
    descripcion: 'Los 3 datos que se muestran debajo de los botones del Hero',
    preview: 'hero-stats',
    campos: [
      {
        clave: 'home.hero.stats.familias',
        label: 'Familias felices (ej: +500)',
      },
      {
        clave: 'home.hero.stats.calificacion',
        label: 'Calificación (ej: 4.9)',
      },
      {
        clave: 'home.hero.stats.anio_fundacion',
        label:
          'Año de fundación — los "años de experiencia" se calculan solos cada año, no hace falta editarlos',
      },
    ],
  },
  {
    id: 'seguridad',
    seccion: 'HOME',
    titulo: 'Seguridad',
    descripcion: 'Bloque de confianza sobre el cuidado de los niños',
    preview: 'seguridad',
    campos: [
      { clave: 'home.seguridad.titulo', label: 'Título' },
      {
        clave: 'home.seguridad.subtitulo',
        label: 'Subtítulo',
        multilinea: true,
      },
    ],
  },
  {
    id: 'historia',
    seccion: 'NOSOTROS',
    titulo: 'Nuestra historia',
    descripcion: 'La historia del local en la página Nosotros',
    preview: 'historia',
    campos: [
      { clave: 'nosotros.historia.badge', label: 'Etiqueta' },
      { clave: 'nosotros.historia.titulo', label: 'Título' },
      {
        clave: 'nosotros.historia.parrafo1',
        label: 'Párrafo 1',
        multilinea: true,
      },
      {
        clave: 'nosotros.historia.parrafo2',
        label: 'Párrafo 2',
        multilinea: true,
      },
      {
        clave: 'nosotros.historia.parrafo3',
        label: 'Párrafo 3',
        multilinea: true,
      },
    ],
  },
  {
    id: 'valores',
    seccion: 'NOSOTROS',
    titulo: 'Nuestros valores',
    descripcion: 'El título y las tarjetas de valores',
    preview: 'valores',
    tipo: 'lista',
    claveTitulo: 'nosotros.valores.titulo',
    claveItems: 'nosotros.valores.items',
    maxDescripcion: MAX_DESCRIPCION_VALOR,
  },
  {
    id: 'reglamento',
    seccion: 'ZONA_JUEGOS',
    titulo: 'Reglamento del local',
    descripcion: 'Las normas que ven los visitantes en la zona de juegos',
    preview: 'reglamento',
    tipo: 'lista-texto',
    claveTitulo: 'zona.reglamento.titulo',
    claveSubtitulo: 'zona.reglamento.subtitulo',
    claveItems: 'zona.reglamento.items',
    maxItem: MAX_LONGITUD_REGLA,
  },
]

export function nombreCampo(clave: string): string {
  return clave.replace(/\W/g, '_')
}

export function clavesDeBloque(bloque: Bloque): string[] {
  if (bloque.tipo === 'lista' || bloque.tipo === 'lista-texto') {
    return [
      bloque.claveTitulo,
      bloque.claveSubtitulo,
      bloque.claveItems,
    ].filter((c): c is string => !!c)
  }
  return (bloque.campos ?? []).map((c) => c.clave)
}

export function parseTextos(json: string | undefined): string[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string')
    }
  } catch {}
  return []
}

export function parseValores(json: string | undefined): ValorItem[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((v) => v && typeof v.titulo === 'string')
        .map((v) => ({
          titulo: String(v.titulo ?? ''),
          descripcion: String(v.descripcion ?? ''),
        }))
    }
  } catch {}
  return []
}
