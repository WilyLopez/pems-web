import { useTiposEventoPublico } from '@/hooks/useComercial'
import { TipoEvento } from '@/types/comercial.types'

export function resolverNombreTipoEvento(
  codigo: string,
  tiposEvento: TipoEvento[] | undefined
): string {
  return tiposEvento?.find((t) => t.codigo === codigo)?.nombre ?? codigo
}

export function useTipoEventoNombre(codigo: string): string {
  const { data: tiposEvento } = useTiposEventoPublico()
  return resolverNombreTipoEvento(codigo, tiposEvento)
}
