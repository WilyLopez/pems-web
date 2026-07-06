'use client'

import { Star } from 'lucide-react'
import { CategoriaFiltro, OPCIONES_FILTRO } from '../constants/categorias'

interface GaleriaFiltrosProps {
  categoria: CategoriaFiltro
  soloDestacadas: boolean
  onCategoriaChange: (categoria: CategoriaFiltro) => void
  onSoloDestacadasChange: (soloDestacadas: boolean) => void
}

export function GaleriaFiltros({
  categoria,
  soloDestacadas,
  onCategoriaChange,
  onSoloDestacadasChange,
}: GaleriaFiltrosProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPCIONES_FILTRO.map((opcion) => {
        const activo = categoria === opcion.value
        return (
          <button
            key={opcion.value}
            type="button"
            aria-pressed={activo}
            onClick={() => onCategoriaChange(opcion.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activo
                ? 'border-brand-azul/40 bg-brand-azul/10 text-brand-azul'
                : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opcion.label}
          </button>
        )
      })}

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <button
        type="button"
        aria-pressed={soloDestacadas}
        onClick={() => onSoloDestacadasChange(!soloDestacadas)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          soloDestacadas
            ? 'border-amber-400/40 bg-amber-400/20 text-amber-700'
            : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        <Star className="h-3.5 w-3.5" />
        Solo destacadas
      </button>
    </div>
  )
}
