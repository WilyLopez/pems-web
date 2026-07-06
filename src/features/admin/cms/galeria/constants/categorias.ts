export const CATEGORIAS_IMAGEN = [
  'CUMPLEANOS',
  'DECORACION',
  'GENERAL',
  'EVENTO',
] as const

export type CategoriaImagen = (typeof CATEGORIAS_IMAGEN)[number]

export const CATEGORIA_LABEL: Record<CategoriaImagen, string> = {
  CUMPLEANOS: 'Cumpleaños',
  DECORACION: 'Decoración',
  GENERAL: 'General',
  EVENTO: 'Evento',
}

export function categoriaLabel(categoria?: string): string {
  if (!categoria) return ''
  return CATEGORIA_LABEL[categoria as CategoriaImagen] ?? categoria
}

export const OPCIONES_CATEGORIA = CATEGORIAS_IMAGEN.map((value) => ({
  value,
  label: CATEGORIA_LABEL[value],
}))

export const CATEGORIA_POR_DEFECTO: CategoriaImagen = 'GENERAL'

export const TODAS_CATEGORIAS = 'TODAS'

export type CategoriaFiltro = CategoriaImagen | typeof TODAS_CATEGORIAS

export const OPCIONES_FILTRO: { value: CategoriaFiltro; label: string }[] = [
  { value: TODAS_CATEGORIAS, label: 'Todas' },
  ...OPCIONES_CATEGORIA,
]
