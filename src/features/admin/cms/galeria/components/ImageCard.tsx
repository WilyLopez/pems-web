'use client'

import { Pencil, Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { ImagenGaleria } from '@/types/galeria.types'
import { categoriaLabel } from '../constants/categorias'
import { formatBytes } from '../lib/archivo'

interface ImageCardProps {
  imagen: ImagenGaleria
  onVer: () => void
  onDestacar: () => void
  onEditar: () => void
  onEliminar: () => void
}

export function ImageCard({
  imagen,
  onVer,
  onDestacar,
  onEditar,
  onEliminar,
}: ImageCardProps) {
  function accion(fn: () => void) {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      fn()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onVer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onVer()
        }
      }}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul"
    >
      <Image
        src={imagen.url}
        alt={imagen.altTexto ?? imagen.titulo ?? 'Imagen galería'}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={accion(onEditar)}
            aria-label="Editar imagen"
            title="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-brand-azul"
          >
            <Pencil className="h-3.5 w-3.5 text-white" />
          </button>
          <button
            type="button"
            onClick={accion(onEliminar)}
            aria-label="Eliminar imagen"
            title="Eliminar"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        <div className="space-y-1">
          {imagen.titulo && (
            <p className="truncate text-xs font-medium text-white">
              {imagen.titulo}
            </p>
          )}
          <div className="flex items-center justify-between gap-1">
            <div className="flex min-w-0 flex-col gap-0.5">
              {imagen.categoria && (
                <span className="w-fit rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] text-white">
                  {categoriaLabel(imagen.categoria)}
                </span>
              )}
              <span className="text-xs text-white/70">
                {formatBytes(imagen.tamanioBytes)}
              </span>
            </div>
            <button
              type="button"
              onClick={accion(onDestacar)}
              aria-label={imagen.destacada ? 'Quitar destacado' : 'Destacar'}
              aria-pressed={imagen.destacada}
              title={imagen.destacada ? 'Quitar destacado' : 'Destacar'}
              className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                imagen.destacada
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-white/20 hover:bg-amber-400'
              }`}
            >
              <Star
                className={`h-3 w-3 ${imagen.destacada ? 'fill-white text-white' : 'text-white'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {imagen.destacada && (
        <div className="absolute right-1.5 top-1.5 z-10 opacity-100 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0 [@media(hover:none)]:opacity-0">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow">
            <Star className="h-3 w-3 fill-white text-white" />
          </div>
        </div>
      )}
    </div>
  )
}
