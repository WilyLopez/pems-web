'use client'

import { useState } from 'react'
import {
  Plus,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  CalendarDays,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { BannerEstadoBadge } from '@/components/admin/banners/BannerEstadoBadge'
import { BannerFormDrawer } from '@/components/admin/banners/BannerFormDrawer'
import {
  useBanners,
  useToggleBanner,
  useDuplicarBanner,
  useEliminarBanner,
} from '@/hooks/useBanners'
import { Banner } from '@/types/banner.types'
import { cn, formatDate } from '@/lib/utils'

const TIPO_CONFIG: Record<string, { label: string; cls: string }> = {
  HERO:        { label: 'Hero',        cls: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20'  },
  PROMOCION:   { label: 'Promocion',   cls: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20'  },
  EVENTO:      { label: 'Evento',      cls: 'bg-purple-100 text-purple-700 border-purple-200'        },
  INFORMATIVO: { label: 'Informativo', cls: 'bg-gray-100 text-gray-600 border-gray-200'              },
  TEMPORADA:   { label: 'Temporada',   cls: 'bg-green-100 text-green-700 border-green-200'           },
}

function TipoBadge({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo] ?? { label: tipo, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

function BannerCard({
  banner,
  onEditar,
  onEliminar,
}: {
  banner:    Banner
  onEditar:  () => void
  onEliminar: () => void
}) {
  const toggle   = useToggleBanner()
  const duplicar = useDuplicarBanner()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-100">
        {banner.imagenUrl ? (
          <img
            src={banner.imagenUrl}
            className="w-full h-full object-cover"
            alt={banner.titulo}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {banner.tipoBanner && (
          <div className="absolute top-2 left-2">
            <TipoBadge tipo={banner.tipoBanner} />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <BannerEstadoBadge banner={banner} />
        </div>

        {(banner.soloMovil || banner.soloDesktop) && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {banner.soloMovil && (
              <div className="bg-black/50 rounded p-1">
                <Smartphone className="h-3 w-3 text-white" />
              </div>
            )}
            {banner.soloDesktop && (
              <div className="bg-black/50 rounded p-1">
                <Monitor className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm text-gray-900 truncate">{banner.titulo}</h3>
        {banner.descripcion && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{banner.descripcion}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>{formatDate(banner.fechaInicio)}</span>
          {banner.fechaFin && (
            <>
              <span className="text-gray-300">→</span>
              <span>{formatDate(banner.fechaFin)}</span>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={banner.activo}
            disabled={toggle.isPending}
            onCheckedChange={() => toggle.mutate({ id: banner.id, activo: banner.activo })}
            className="scale-[0.8]"
          />
          <span className="text-xs text-gray-500">{banner.activo ? 'Activo' : 'Inactivo'}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={onEditar}
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => duplicar.mutate(banner.id)}
            disabled={duplicar.isPending}
            title="Duplicar"
          >
            {duplicar.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive"
            onClick={onEliminar}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BannersPage() {
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [bannerEditando, setBannerEditando] = useState<Banner | null>(null)
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [eliminarTarget, setEliminarTarget] = useState<Banner | null>(null)

  const { data, isLoading, isError, refetch } = useBanners()
  const eliminar = useEliminarBanner()

  function abrirCrear() {
    setBannerEditando(null)
    setDrawerOpen(true)
  }

  function abrirEditar(b: Banner) {
    setBannerEditando(b)
    setDrawerOpen(true)
  }

  function cerrarDrawer() {
    setDrawerOpen(false)
    setBannerEditando(null)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
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

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && data?.content?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Sin banners creados</p>
          <Button variant="outline" onClick={abrirCrear} className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" /> Crear primer banner
          </Button>
        </div>
      )}

      {!isLoading && data?.content && data.content.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.content.map((banner) => (
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
