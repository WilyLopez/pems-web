'use client'

import { useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { ImagenGaleria } from '@/types/galeria.types'

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ImageCardProps {
  imagen: ImagenGaleria
  onDestacar: () => void
  onEliminar: () => void
}

export function ImageCard({ imagen, onDestacar, onEliminar }: ImageCardProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted aspect-square"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Image
        src={imagen.url}
        alt={imagen.titulo ?? 'Imagen galería'}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          hover ? 'opacity-100' : 'opacity-0'
        } flex flex-col justify-between p-2 z-10`}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEliminar}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-destructive flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        <div className="space-y-1">
          {imagen.titulo && (
            <p className="text-white text-xs font-medium truncate">
              {imagen.titulo}
            </p>
          )}
          <div className="flex items-center justify-between gap-1">
            <span className="text-white/70 text-xs">
              {formatBytes(imagen.tamanioBytes)}
            </span>
            <button
              type="button"
              onClick={onDestacar}
              className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                imagen.destacada
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-white/20 hover:bg-amber-400'
              }`}
              title={imagen.destacada ? 'Quitar destacado' : 'Destacar'}
            >
              <Star
                className={`h-3 w-3 ${imagen.destacada ? 'text-white fill-white' : 'text-white'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Badge destacada siempre visible */}
      {imagen.destacada && !hover && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  )
}
