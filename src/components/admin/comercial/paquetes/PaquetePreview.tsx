'use client'

import { Check, MessageCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  nombre:          string
  precio:          number
  descripcionCorta: string
  beneficios:      string[]
  imagenUrl:       string | null
  color?:          string
}

export function PaquetePreview({ nombre, precio, descripcionCorta, beneficios, imagenUrl, color }: Props) {
  const beneficiosValidos = beneficios.filter(Boolean)
  const baseColor = color || '#00AEEF'

  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">
        Vista previa — /celebraciones
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="aspect-video bg-gray-100 relative">
          {imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagenUrl} alt={nombre} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}aa 100%)`
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
              <p className="text-xs text-white/80 relative z-10 font-bold uppercase tracking-wider">Sin imagen</p>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-gray-900 text-lg leading-tight">
              {nombre || <span className="text-gray-300">Nombre del paquete</span>}
            </h3>
            <span className="font-black text-lg shrink-0" style={{ color: baseColor }}>
              {precio ? formatCurrency(precio) : <span className="text-gray-300">S/ 0</span>}
            </span>
          </div>

          {descripcionCorta && (
            <p className="text-sm text-gray-500 line-clamp-2">{descripcionCorta}</p>
          )}

          {beneficiosValidos.length > 0 && (
            <ul className="space-y-1">
              {beneficiosValidos.slice(0, 4).map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${baseColor}1a` }}
                  >
                    <Check className="h-2.5 w-2.5" style={{ color: baseColor }} />
                  </div>
                  <span className="line-clamp-1">{b}</span>
                </li>
              ))}
              {beneficiosValidos.length > 4 && (
                <li className="text-xs text-gray-400 ml-6">
                  +{beneficiosValidos.length - 4} más incluidos
                </li>
              )}
            </ul>
          )}

          <div className="flex gap-2 pt-1">
            <div
              className="flex-1 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: baseColor }}
            >
              Solicitar
            </div>
            <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
