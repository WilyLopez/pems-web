'use client'

import { VARIABLES_MARKETING } from '@/types/emailBlocks.types'
import { cn } from '@/lib/utils'

interface Props {
  onInsert: (variable: string) => void
  className?: string
}

export function VariableChips({ onInsert, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Variables disponibles
      </p>
      <div className="flex flex-wrap gap-1.5">
        {VARIABLES_MARKETING.map((v) => (
          <button
            key={v.nombre}
            type="button"
            title={`${v.descripcion} — Ej: ${v.ejemplo}`}
            onClick={() => onInsert(`{{${v.nombre}}}`)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-azul/8 border border-brand-azul/20 text-brand-azul text-[11px] font-mono font-semibold hover:bg-brand-azul/15 hover:border-brand-azul/40 transition-colors cursor-pointer"
          >
            <span className="text-brand-azul/60">+</span>
            {`{{${v.nombre}}}`}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400">
        Haz clic en una variable para insertarla en el campo activo.
      </p>
    </div>
  )
}
