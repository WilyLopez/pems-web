'use client'

import { useState } from 'react'
import { Columns2, Eye, Code } from 'lucide-react'
import { Contrato } from '@/types/contrato.types'
import { cn } from '@/lib/utils'

interface ContratoEditorProps {
  value: string
  onChange: (v: string) => void
  contrato?: Partial<Contrato>
  readOnly?: boolean
}

export function ContratoEditor({
  value,
  onChange,
  readOnly,
}: ContratoEditorProps) {
  const [vista, setVista] = useState<'editor' | 'preview' | 'split'>('split')

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {(
            [
              { v: 'editor', icon: Code, label: 'Editor' },
              { v: 'split', icon: Columns2, label: 'Dividido' },
              { v: 'preview', icon: Eye, label: 'Vista previa' },
            ] as const
          ).map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                vista === v
                  ? 'bg-white text-brand-azul shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'border border-gray-200 rounded-2xl overflow-hidden',
          vista === 'split' && 'grid grid-cols-2'
        )}
      >
        {(vista === 'editor' || vista === 'split') && (
          <div
            className={cn(
              'relative',
              vista === 'split' && 'border-r border-gray-200'
            )}
          >
            {vista === 'split' && (
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Editor
              </div>
            )}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              readOnly={readOnly}
              rows={22}
              className={cn(
                'w-full p-4 text-xs font-mono text-gray-800 leading-relaxed resize-none outline-none bg-white',
                readOnly && 'bg-gray-50 cursor-default'
              )}
              placeholder="Redacta el contenido del contrato..."
            />
          </div>
        )}

        {(vista === 'preview' || vista === 'split') && (
          <div>
            {vista === 'split' && (
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Vista previa
              </div>
            )}
            <div
              className="p-6 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[440px] bg-white font-serif"
              style={{ maxHeight: 440, overflowY: 'auto' }}
            >
              {value || (
                <span className="text-gray-300 italic">
                  El contenido del contrato aparecerá aquí...
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
