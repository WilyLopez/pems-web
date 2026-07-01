'use client'

import {
  Image as ImageIcon,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  CalendarDays,
  Monitor,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { BannerEstadoBadge } from '@/components/admin/banners/BannerEstadoBadge'
import { useToggleBanner, useDuplicarBanner } from '../hooks/useBanners'
import { Banner } from '@/types/banner.types'
import { cn, formatDate } from '@/lib/utils'

const TIPO_CONFIG: Record<string, { label: string; cls: string }> = {
  HERO: {
    label: 'Hero',
    cls: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
  },
  PROMOCION: {
    label: 'Promocion',
    cls: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20',
  },
  EVENTO: {
    label: 'Evento',
    cls: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  INFORMATIVO: {
    label: 'Informativo',
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  TEMPORADA: {
    label: 'Temporada',
    cls: 'bg-green-100 text-green-700 border-green-200',
  },
}

export function TipoBadge({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo] ?? {
    label: tipo,
    cls: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
        cfg.cls
      )}
    >
      {cfg.label}
    </span>
  )
}

interface BannerCardProps {
  banner: Banner
  onEditar: () => void
  onEliminar: () => void
}

export function BannerCard({ banner, onEditar, onEliminar }: BannerCardProps) {
  const toggle = useToggleBanner()
  const duplicar = useDuplicarBanner()

  const overlayHex = banner.colorOverlay ?? '#001a2c'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* ── Preview — matches public render exactly ── */}
      <div className="relative aspect-[16/7] bg-gray-100 overflow-hidden">
        {banner.imagenUrl ? (
          <Image
            src={banner.imagenUrl}
            alt={banner.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {/* Overlay gradient matching the public render */}
        {banner.imagenUrl && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(120deg, ${overlayHex}d0 0%, ${overlayHex}80 50%, transparent 100%)`,
            }}
          />
        )}

        {/* Text preview overlay — mimics the public Hero layout */}
        {banner.imagenUrl && (
          <div className="absolute inset-0 flex flex-col justify-end p-3 space-y-1">
            <p className="text-white font-black text-xs leading-tight line-clamp-1 drop-shadow">
              {banner.titulo}
            </p>
            {banner.descripcion && (
              <p className="text-white/70 text-[10px] line-clamp-1">
                {banner.descripcion}
              </p>
            )}
            {banner.textoBoton && (
              <div className="inline-flex items-center gap-1 bg-brand-amarillo text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-full w-fit">
                <ExternalLink className="h-2.5 w-2.5" />
                {banner.textoBoton}
              </div>
            )}
          </div>
        )}

        {/* Type badge */}
        {banner.tipoBanner && (
          <div className="absolute top-2 left-2 z-10">
            <TipoBadge tipo={banner.tipoBanner} />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2 z-10">
          <BannerEstadoBadge banner={banner} />
        </div>

        {/* Device indicators */}
        {(banner.soloMovil || banner.soloDesktop || banner.imagenMovilUrl) && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-10">
            {banner.imagenMovilUrl && (
              <div className="bg-brand-azul/80 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                <Smartphone className="h-2.5 w-2.5 text-white" />
                <span className="text-white text-[8px] font-bold">Alt</span>
              </div>
            )}
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

      {/* ── Info ── */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-gray-900 truncate">
          {banner.titulo}
        </h3>
        {banner.descripcion && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {banner.descripcion}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span>{formatDate(banner.fechaInicio)}</span>
            {banner.fechaFin && (
              <>
                <span className="text-gray-300">→</span>
                <span>{formatDate(banner.fechaFin)}</span>
              </>
            )}
          </div>
          {/* Color overlay swatch */}
          {banner.colorOverlay && (
            <div
              className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
              title={`Overlay: ${banner.colorOverlay}`}
              style={{ backgroundColor: banner.colorOverlay }}
            />
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={banner.activo}
            disabled={toggle.isPending}
            onCheckedChange={() =>
              toggle.mutate({ id: banner.id, activo: banner.activo })
            }
            className="scale-[0.8]"
          />
          <span className="text-xs text-gray-500">
            {banner.activo ? 'Activo' : 'Inactivo'}
          </span>
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
