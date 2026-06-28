'use client'

import { useState } from 'react'
import { Plus, Image as ImageIcon, Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { BannerFormDrawer } from '@/components/admin/banners/BannerFormDrawer'
import {
  useBanners,
  useEliminarBanner,
} from '@/features/admin/cms/banners/hooks/useBanners'
import { BannerCard } from '@/features/admin/cms/banners/components/BannerCard'
import { Banner } from '@/types/banner.types'
import { cn } from '@/lib/utils'

export default function BannersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const tipoFiltro = searchParams.get('tipo') ?? 'TODOS'
  const formOpenParam = searchParams.get('open') === 'true'
  const editIdParam = searchParams.get('edit')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [eliminarTarget, setEliminarTarget] = useState<Banner | null>(null)

  const { data, isLoading, isError, refetch } = useBanners()
  const eliminar = useEliminarBanner()

  const banners = data?.content ?? []
  const bannerEditando = editIdParam
    ? (banners.find((b) => b.id === Number(editIdParam)) ?? null)
    : null

  const drawerOpen = formOpenParam || !!bannerEditando

  function abrirCrear() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('open', 'true')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function abrirEditar(b: Banner) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit', b.id.toString())
    params.delete('open')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function cerrarDrawer() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('open')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSelectTipo(tipo: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (tipo && tipo !== 'TODOS') {
      params.set('tipo', tipo)
    } else {
      params.delete('tipo')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (isError) return <ErrorState onRetry={refetch} />

  const filteredBanners = banners.filter((b) => {
    const matchesQuery =
      b.titulo.toLowerCase().includes(query.toLowerCase()) ||
      (b.descripcion &&
        b.descripcion.toLowerCase().includes(query.toLowerCase()))
    const matchesTipo = tipoFiltro === 'TODOS' || b.tipoBanner === tipoFiltro
    return matchesQuery && matchesTipo
  })

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Banners' }]}
      />

      <PageHeader
        title="Banners"
        description="Gestiona los banners del sitio publico"
        actions={
          <Button onClick={abrirCrear} className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo banner
          </Button>
        }
      />

      {banners.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar banner por título o descripción..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 self-stretch sm:self-auto justify-center">
            {[
              'TODOS',
              'HERO',
              'PROMOCION',
              'EVENTO',
              'INFORMATIVO',
              'TEMPORADA',
            ].map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTipo(t)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  tipoFiltro === t
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                    : 'text-gray-500 hover:text-gray-900 border border-transparent'
                )}
              >
                {t === 'TODOS'
                  ? 'Todos'
                  : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-gray-100"
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Sin banners creados
          </p>
          <Button
            variant="outline"
            onClick={abrirCrear}
            className="rounded-xl gap-1.5"
          >
            <Plus className="h-4 w-4" /> Crear primer banner
          </Button>
        </div>
      )}

      {!isLoading && banners.length > 0 && filteredBanners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-500">
            No se encontraron banners que coincidan con la búsqueda.
          </p>
        </div>
      )}

      {!isLoading && filteredBanners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEditar={() => abrirEditar(banner)}
              onEliminar={() => {
                setEliminarTarget(banner)
                setConfirmOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <BannerFormDrawer
        key={editIdParam ?? (formOpenParam ? 'new' : 'none')}
        open={drawerOpen}
        onClose={cerrarDrawer}
        banner={bannerEditando}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!o) {
            setConfirmOpen(false)
            setEliminarTarget(null)
          }
        }}
        title="Eliminar banner"
        description={`Se eliminara el banner "${eliminarTarget?.titulo}". Esta accion no puede revertirse.`}
        confirmLabel="Eliminar"
        destructive
        loading={eliminar.isPending}
        onConfirm={() => {
          if (eliminarTarget) {
            eliminar.mutate(eliminarTarget.id, {
              onSuccess: () => {
                setConfirmOpen(false)
                setEliminarTarget(null)
              },
            })
          }
        }}
      />
    </div>
  )
}
