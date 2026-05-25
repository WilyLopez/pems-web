'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BannerPreviewProps {
  imagenUrl:       string
  imagenMovilUrl?: string
  titulo:          string
  descripcion?:    string
  textoBoton?:     string
  colorOverlay?:   string
  overlayOpacity:  number
  tipoBanner?:     string
  soloMovil?:      boolean
  soloDesktop?:    boolean
}

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

export function BannerPreview({
  imagenUrl,
  imagenMovilUrl,
  titulo,
  descripcion,
  textoBoton,
  colorOverlay,
  overlayOpacity,
  tipoBanner,
  soloMovil,
  soloDesktop,
}: BannerPreviewProps) {
  const [dispositivo, setDispositivo] = useState<'desktop' | 'movil'>('desktop')
  const srcImagen = dispositivo === 'movil' && imagenMovilUrl ? imagenMovilUrl : imagenUrl

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Vista previa</span>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {(['desktop', 'movil'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDispositivo(d)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                dispositivo === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              )}
            >
              {d === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
              {d === 'desktop' ? 'Desktop' : 'Movil'}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl bg-gray-100"
        style={{
          aspectRatio: dispositivo === 'desktop' ? '16/9' : '9/16',
          maxHeight:   dispositivo === 'movil' ? '360px' : 'none',
        }}
      >
        {srcImagen ? (
          <img
            src={srcImagen}
            className="absolute inset-0 w-full h-full object-cover"
            alt="preview banner"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
            <ImageIcon className="h-10 w-10 text-gray-300" />
            <p className="text-xs text-gray-400">Sube una imagen para ver la vista previa</p>
          </div>
        )}

        {colorOverlay && overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: colorOverlay, opacity: overlayOpacity / 100 }}
          />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {titulo && (
            <p className="text-white font-black text-lg leading-tight drop-shadow-lg mb-1.5 line-clamp-2">
              {titulo}
            </p>
          )}
          {descripcion && (
            <p className="text-white/85 text-xs leading-relaxed drop-shadow mb-3 line-clamp-2">
              {descripcion}
            </p>
          )}
          {textoBoton && (
            <div>
              <span className="bg-brand-azul text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                {textoBoton}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {tipoBanner && <TipoBadge tipo={tipoBanner} />}
        {soloMovil && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
            Solo movil
          </span>
        )}
        {soloDesktop && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
            Solo desktop
          </span>
        )}
      </div>
    </div>
  )
}
