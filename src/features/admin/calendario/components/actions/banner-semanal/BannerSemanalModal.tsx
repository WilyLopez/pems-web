'use client'

import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useBannerSemanalData } from './useBannerSemanalData'
import { BannerSemanalVertical } from './BannerSemanalVertical'
import { BannerSemanalHorizontal } from './BannerSemanalHorizontal'
import { BannerSemanalMovil } from './BannerSemanalMovil'
import { MediaValue } from '@/types/media.types'

interface Preset {
  id: 'web' | 'movil' | 'feed' | 'historia'
  label: string
  width: number
  height: number
  sitio: boolean
}

const PRESETS: Preset[] = [
  {
    id: 'web',
    label: 'Banner web',
    width: 1940,
    height: 500,
    sitio: true,
  },
  {
    id: 'movil',
    label: 'Banner móvil',
    width: 1200,
    height: 600,
    sitio: true,
  },
  {
    id: 'feed',
    label: 'Redes · Feed',
    width: 1080,
    height: 1080,
    sitio: false,
  },
  {
    id: 'historia',
    label: 'Redes · Historia',
    width: 1080,
    height: 1920,
    sitio: false,
  },
]

const PREVIEW_MAX_W = 620
const PREVIEW_MAX_H = 440

interface Props {
  idSede: number
  open: boolean
  onClose: () => void
  onUsarComoBanner: (imagen: MediaValue) => void
}

export function BannerSemanalModal({
  idSede,
  open,
  onClose,
  onUsarComoBanner,
}: Props) {
  const [presetId, setPresetId] = useState<Preset['id']>('web')
  const [exportando, setExportando] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  const data = useBannerSemanalData(idSede)
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const scale = Math.min(
    PREVIEW_MAX_W / preset.width,
    PREVIEW_MAX_H / preset.height,
    1
  )

  async function capturar(): Promise<MediaValue | null> {
    if (!nodeRef.current) return null
    try {
      const dataUrl = await toPng(nodeRef.current, {
        width: preset.width,
        height: preset.height,
        pixelRatio: 1,
        cacheBust: true,
        fetchRequestInit: { mode: 'cors' },
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `banner-semanal-${preset.id}.png`, {
        type: 'image/png',
      })
      return { url: URL.createObjectURL(blob), file, esLocal: true }
    } catch {
      toast.error('No se pudo generar la imagen. Intenta de nuevo.')
      return null
    }
  }

  async function handleDescargar() {
    setExportando(true)
    const resultado = await capturar()
    setExportando(false)
    if (!resultado) return
    const a = document.createElement('a')
    a.href = resultado.url
    a.download = `banner-semanal-${preset.id}.png`
    a.click()
  }

  async function handleUsarComoBanner() {
    setExportando(true)
    const resultado = await capturar()
    setExportando(false)
    if (!resultado) return
    onUsarComoBanner(resultado)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0">
              <ImagePlus className="h-4.5 w-4.5 text-brand-rosa" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-gray-900 leading-none">
                Banner semanal
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-1">
                Generado con datos en vivo del calendario y la galería
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5">
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2 py-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={data.irSemanaAnterior}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-gray-700 px-1 flex items-center gap-1.5 whitespace-nowrap">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                {format(data.inicioSemana, 'd MMM', { locale: es })} —{' '}
                {format(data.finSemana, 'd MMM yyyy', { locale: es })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={data.irSemanaSiguiente}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 pt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetId(p.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-colors',
                  presetId === p.id
                    ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                    : 'border-gray-200 text-gray-500 hover:border-brand-rosa/40'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="px-6 py-6 flex justify-center">
            {data.cargando ? (
              <div
                className="flex items-center justify-center py-16"
                style={{ width: PREVIEW_MAX_W }}
              >
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : (
              <div
                style={{
                  width: preset.width * scale,
                  height: preset.height * scale,
                }}
                className="overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white"
              >
                <div
                  style={{
                    width: preset.width,
                    height: preset.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {preset.id === 'web' && (
                    <BannerSemanalHorizontal
                      ref={nodeRef}
                      width={preset.width}
                      height={preset.height}
                      data={data}
                    />
                  )}
                  {preset.id === 'movil' && (
                    <BannerSemanalMovil
                      ref={nodeRef}
                      width={preset.width}
                      height={preset.height}
                      data={data}
                    />
                  )}
                  {(preset.id === 'feed' || preset.id === 'historia') && (
                    <BannerSemanalVertical
                      ref={nodeRef}
                      width={preset.width}
                      height={preset.height}
                      data={data}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={handleDescargar}
            disabled={exportando || data.cargando}
          >
            {exportando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar imagen
          </Button>
          {preset.sitio && (
            <Button
              className="rounded-xl gap-2 bg-brand-rosa hover:bg-brand-rosa/90 text-white"
              onClick={handleUsarComoBanner}
              disabled={exportando || data.cargando}
            >
              {exportando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Usar como banner del sitio
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
