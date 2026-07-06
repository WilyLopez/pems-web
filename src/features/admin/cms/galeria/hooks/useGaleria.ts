'use client'

import { useCallback, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { galeriaService } from '@/services/galeria.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import {
  ActualizarImagenGaleriaPayload,
  ImagenGaleria,
} from '@/types/galeria.types'
import { CategoriaImagen } from '../constants/categorias'
import { claveArchivo } from '../lib/archivo'

const FALLBACK_DETALLE_SIZE = 100
const PAGE_SIZE = 24

export type EstadoArchivo = 'pendiente' | 'subiendo' | 'ok' | 'error'

export interface ArchivoPendiente {
  file: File
  titulo: string
  descripcion: string
}

export interface ResultadoLote {
  exitosas: number
  fallidas: number
  fallidasItems: ArchivoPendiente[]
}

export function useGaleria(page = 0, size = 20, soloDestacadas = false) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.galeria.lista({ page, size, soloDestacadas }),
    queryFn: () => galeriaService.listar(page, size, soloDestacadas),
    staleTime: 30_000,
  })
}

export function useGaleriaInfinita(soloDestacadas = false, size = PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: CMS_QUERY_KEYS.galeria.infinita({ size, soloDestacadas }),
    queryFn: ({ pageParam }) =>
      galeriaService.listar(pageParam, size, soloDestacadas),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.last ? undefined : ultima.page + 1),
    staleTime: 30_000,
  })
}

function extraerContenido(data: unknown): ImagenGaleria[] {
  if (!data || typeof data !== 'object') return []
  const obj = data as {
    content?: ImagenGaleria[]
    pages?: { content?: ImagenGaleria[] }[]
  }
  if (Array.isArray(obj.content)) return obj.content
  if (Array.isArray(obj.pages)) {
    return obj.pages.flatMap((pagina) => pagina.content ?? [])
  }
  return []
}

export function useImagen(id: number) {
  const qc = useQueryClient()

  const desdeCache = (): ImagenGaleria | undefined => {
    const cacheadas = qc.getQueriesData({
      queryKey: CMS_QUERY_KEYS.galeria.all,
    })
    for (const [, data] of cacheadas) {
      const encontrada = extraerContenido(data).find((img) => img.id === id)
      if (encontrada) return encontrada
    }
    return undefined
  }

  return useQuery({
    queryKey: CMS_QUERY_KEYS.galeria.detalle(id),
    queryFn: async () => {
      const enCache = desdeCache()
      if (enCache) return enCache
      const pagina = await galeriaService.listar(
        0,
        FALLBACK_DETALLE_SIZE,
        false
      )
      const encontrada = pagina.content.find((img) => img.id === id)
      if (!encontrada) throw new Error('Imagen no encontrada')
      return encontrada
    },
    initialData: desdeCache,
    enabled: Number.isFinite(id),
    staleTime: 30_000,
  })
}

export function useGaleriaConteo() {
  const total = useQuery({
    queryKey: CMS_QUERY_KEYS.galeria.lista({
      page: 0,
      size: 1,
      soloDestacadas: false,
    }),
    queryFn: () => galeriaService.listar(0, 1, false),
    staleTime: 30_000,
  })
  const destacadas = useQuery({
    queryKey: CMS_QUERY_KEYS.galeria.lista({
      page: 0,
      size: 1,
      soloDestacadas: true,
    }),
    queryFn: () => galeriaService.listar(0, 1, true),
    staleTime: 30_000,
  })
  return {
    total: total.data?.totalElements ?? 0,
    destacadas: destacadas.data?.totalElements ?? 0,
    isLoading: total.isLoading || destacadas.isLoading,
  }
}

export function useSubirLote() {
  const qc = useQueryClient()
  const [estados, setEstados] = useState<Record<string, EstadoArchivo>>({})
  const [progreso, setProgreso] = useState({ hechas: 0, total: 0 })
  const [isSubiendo, setIsSubiendo] = useState(false)

  const reset = useCallback(() => {
    setEstados({})
    setProgreso({ hechas: 0, total: 0 })
  }, [])

  const subirLote = useCallback(
    async (
      items: ArchivoPendiente[],
      categoria: CategoriaImagen,
      ordenInicial = 0
    ): Promise<ResultadoLote> => {
      if (items.length === 0) {
        return { exitosas: 0, fallidas: 0, fallidasItems: [] }
      }

      setIsSubiendo(true)
      setProgreso({ hechas: 0, total: items.length })
      setEstados(
        Object.fromEntries(
          items.map((it) => [
            claveArchivo(it.file),
            'pendiente' as EstadoArchivo,
          ])
        )
      )

      const fallidasItems: ArchivoPendiente[] = []
      let exitosas = 0
      let indice = 0

      for (const item of items) {
        const clave = claveArchivo(item.file)
        setEstados((prev) => ({ ...prev, [clave]: 'subiendo' }))
        try {
          await galeriaService.subirImagen({
            archivo: item.file,
            categoria,
            titulo: item.titulo.trim() || undefined,
            descripcion: item.descripcion.trim() || undefined,
            orden: ordenInicial + indice,
          })
          setEstados((prev) => ({ ...prev, [clave]: 'ok' }))
          exitosas += 1
        } catch {
          setEstados((prev) => ({ ...prev, [clave]: 'error' }))
          fallidasItems.push(item)
        }
        indice += 1
        setProgreso((prev) => ({ ...prev, hechas: prev.hechas + 1 }))
      }

      await qc.invalidateQueries({ queryKey: CMS_QUERY_KEYS.galeria.all })
      setIsSubiendo(false)

      const fallidas = fallidasItems.length
      if (fallidas === 0) {
        toast.success(
          exitosas === 1 ? 'Imagen subida.' : `${exitosas} imágenes subidas.`
        )
      } else if (exitosas === 0) {
        toast.error('No se pudo subir ninguna imagen.')
      } else {
        toast.warning(`${exitosas} subidas, ${fallidas} con error.`)
      }

      return { exitosas, fallidas, fallidasItems }
    },
    [qc]
  )

  return { subirLote, estados, progreso, isSubiendo, reset }
}

export function useActualizarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarImagenGaleriaPayload
    }) => galeriaService.actualizar(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEYS.galeria.all })
      toast.success('Imagen actualizada.')
    },
    onError: () => toast.error('No se pudo actualizar la imagen.'),
  })
}

export function useDestacarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, destacada }: { id: number; destacada: boolean }) =>
      destacada
        ? galeriaService.quitarDestacado(id)
        : galeriaService.destacar(id),
    onSuccess: (_, { destacada }) => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEYS.galeria.all })
      toast.success(destacada ? 'Destacado removido.' : 'Imagen destacada.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useEliminarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => galeriaService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEYS.galeria.all })
      toast.success('Imagen eliminada.')
    },
    onError: () => toast.error('No se pudo eliminar la imagen.'),
  })
}
