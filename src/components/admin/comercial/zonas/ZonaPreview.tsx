'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  nombre:      string
  descripcion: string
  edadMin?:    number | null
  edadMax?:    number | null
  imagenes:    string[]
}

export function ZonaPreview({ nombre, descripcion, edadMin, edadMax, imagenes }: Props) {
  const [imgActiva, setImgActiva] = useState(0)
  const imagenMostrada = imagenes[imgActiva] ?? null

  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Vista previa — /zona-de-juegos
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="aspect-video bg-gray-100 relative">
          {imagenMostrada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagenMostrada} alt={nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-gray-300">Sin imagen</p>
            </div>
          )}
          {imagenes.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgActiva(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all bg-white',
                    i === imgActiva ? 'w-3' : 'w-1.5 opacity-50'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {(edadMin != null || edadMax != null) && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-brand-azul bg-brand-azul/10 px-2 py-0.5 rounded-full">
              {edadMin ?? '?'}–{edadMax ?? '?'} años
            </span>
          )}
          <h3 className="font-black text-gray-900">
            {nombre || <span className="text-gray-300">Nombre de la zona</span>}
          </h3>
          {descripcion && (
            <p className="text-xs text-gray-500 line-clamp-2">{descripcion}</p>
          )}
        </div>
      </div>
    </div>
  )
}
