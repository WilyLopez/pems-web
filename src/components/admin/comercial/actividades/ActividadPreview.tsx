'use client'

import { Activity } from 'lucide-react'

interface Props {
  nombre: string
  descripcion: string
  imagenUrl: string | null
  esEspecial: boolean
  nombreZona?: string
}

export function ActividadPreview({
  nombre,
  descripcion,
  imagenUrl,
  esEspecial,
  nombreZona,
}: Props) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Vista previa — /zona-de-juegos
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagenUrl}
            alt={nombre}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center">
            <Activity className="h-6 w-6 text-gray-300" />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm">
              {nombre || <span className="text-gray-300">Nombre</span>}
            </h4>
            {esEspecial && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                Especial
              </span>
            )}
          </div>
          {descripcion && (
            <p className="text-xs text-gray-500 line-clamp-2">{descripcion}</p>
          )}
          {nombreZona && (
            <p className="text-[11px] text-brand-azul font-semibold">
              {nombreZona}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
