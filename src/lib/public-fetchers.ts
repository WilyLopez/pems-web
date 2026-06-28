import type { ApiResponse } from '@/types/api.types'
import type { Banner } from '@/types/banner.types'
import type {
  NovedadLocal,
  ZonaJuego,
  PaqueteEvento,
} from '@/types/comercial.types'
import type { ConfiguracionPublica } from '@/types/configuracion-publica.types'
import type { Sede } from '@/types/configuracion.types'
import type { Faq } from '@/types/faq.types'
import type { Promocion } from '@/types/promocion.types'
import type { PrecioPublicoResponse } from '@/features/public/hooks/usePublicPrecios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

async function fetchPublico<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  const json: ApiResponse<T> = await res.json()
  return json.data
}

export const fetchBannersPublico = (idSede: number): Promise<Banner[]> =>
  fetchPublico(`/banners/publico?idSede=${idSede}`)

export const fetchNovedades = (): Promise<NovedadLocal[]> =>
  fetchPublico('/novedades/home')

export const fetchPromociones = (): Promise<Promocion[]> =>
  fetchPublico('/promociones/publicas')

export const fetchZonas = (): Promise<ZonaJuego[]> => fetchPublico('/zonas')

export const fetchPaquetes = (): Promise<PaqueteEvento[]> =>
  fetchPublico('/paquetes')

export const fetchConfigPublica = (): Promise<ConfiguracionPublica> =>
  fetchPublico('/cms/configuracion/publica')

export const fetchPublicPrecios = (
  idSede: number
): Promise<PrecioPublicoResponse[]> =>
  fetchPublico(`/tarifas/sedes/${idSede}/precios`)

export const fetchSedeActiva = async (): Promise<Sede | null> => {
  const sedes = await fetchPublico<Sede[]>('/sedes')
  return sedes.find((s) => s.activo) ?? sedes[0] ?? null
}

export const fetchFaqs = (): Promise<Faq[]> => fetchPublico('/cms/faqs/publico')
