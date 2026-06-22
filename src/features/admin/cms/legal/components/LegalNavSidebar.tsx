'use client'

import {
  FileText,
  Plus,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { labelParaTipo, esTipoPredefinido, TIPOS_SIEMPRE_ACTIVOS } from '@/types/legal.types'
import { cn } from '@/lib/utils'

interface LegalNavSidebarProps {
  tipos: Array<{ tipo: string; activo: boolean }>
  tipoActivo: string
  onSelect: (tipo: string) => void
  onNuevo: () => void
  onToggle: (tipo: string, activo: boolean) => void
  onEliminar: (tipo: string) => void
}

export function LegalNavSidebar({
  tipos,
  tipoActivo,
  onSelect,
  onNuevo,
  onToggle,
  onEliminar,
}: LegalNavSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documentos
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNuevo}
          className="h-6 w-6 p-0"
          title="Nuevo documento"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-auto py-1">
        {tipos.map(({ tipo, activo }) => (
          <div
            key={tipo}
            className={cn(
              'group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors',
              tipoActivo === tipo && 'bg-brand-azul/10 border-r-2 border-brand-azul'
            )}
            onClick={() => onSelect(tipo)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  tipoActivo === tipo ? 'text-brand-azul' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs truncate',
                  tipoActivo === tipo ? 'font-semibold text-brand-azul' : 'text-foreground'
                )}
              >
                {labelParaTipo(tipo)}
              </span>
            </div>

            {TIPOS_SIEMPRE_ACTIVOS.has(tipo) ? (
              <span
                title="Siempre activo — requerido por el sistema"
                className="shrink-0 ml-1 flex items-center gap-0.5 text-[10px] font-medium text-brand-azul/70"
              >
                <ShieldCheck className="h-3 w-3" />
              </span>
            ) : !esTipoPredefinido(tipo) && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                <button
                  type="button"
                  title={activo ? 'Desactivar' : 'Activar'}
                  onClick={(e) => { e.stopPropagation(); onToggle(tipo, !activo) }}
                  className="p-0.5 rounded hover:bg-muted"
                >
                  {activo ? (
                    <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>

                <button
                  type="button"
                  title="Eliminar"
                  onClick={(e) => { e.stopPropagation(); onEliminar(tipo) }}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
