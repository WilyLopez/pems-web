'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { PlantillaEmail } from '@/types/marketing.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface Props {
  plantilla: PlantillaEmail
  actions?: ReactNode
}

export function PlantillaPreviewCard({ plantilla, actions }: Props) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm truncate">{plantilla.nombre}</p>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-azul/10 text-brand-azul shrink-0">
              {plantilla.tipoEmailNombre}
            </span>
            <span
              className={cn(
                'text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
                plantilla.activa
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {plantilla.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{plantilla.asunto}</span>
          </div>
          {plantilla.variablesPermitidas && (
            <p className="text-[11px] text-gray-400">
              Variables: {plantilla.variablesPermitidas}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPreview((v) => !v)}
            className="h-7 text-xs gap-1"
          >
            {showPreview ? (
              <><EyeOff className="h-3.5 w-3.5" /> Ocultar</>
            ) : (
              <><Eye className="h-3.5 w-3.5" /> Vista previa</>
            )}
          </Button>
          {actions}
        </div>
      </div>

      {showPreview && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-2 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Vista previa HTML
            </span>
            <span className="text-[10px] text-gray-400">
              Actualizado: {plantilla.fechaActualizacion?.split('T')[0]}
            </span>
          </div>
          <div className="relative w-full overflow-hidden" style={{ height: 420 }}>
            <iframe
              srcDoc={plantilla.contenidoHtml}
              title={`Preview ${plantilla.nombre}`}
              sandbox="allow-same-origin"
              className="w-full h-full border-0"
              style={{ background: '#fff' }}
            />
          </div>
          {plantilla.contenidoFallback && (
            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Fallback texto plano
              </p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                {plantilla.contenidoFallback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
