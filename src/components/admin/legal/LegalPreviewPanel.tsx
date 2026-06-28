'use client'

import { useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  contenido: string
}

export function LegalPreviewPanel({ titulo, contenido }: Props) {
  const [modo, setModo] = useState<'desktop' | 'movil'>('desktop')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Vista previa
        </span>
        <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setModo('desktop')}
            className={cn(
              'h-7 gap-1.5 px-2 text-xs',
              modo === 'desktop' && 'bg-background shadow-sm'
            )}
          >
            <Monitor className="h-3 w-3" />
            Escritorio
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setModo('movil')}
            className={cn(
              'h-7 gap-1.5 px-2 text-xs',
              modo === 'movil' && 'bg-background shadow-sm'
            )}
          >
            <Smartphone className="h-3 w-3" />
            Móvil
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border bg-white">
        <div
          className={cn(
            'mx-auto transition-all duration-300',
            modo === 'desktop'
              ? 'max-w-full px-10 py-8'
              : 'max-w-[390px] px-5 py-6'
          )}
        >
          {titulo && (
            <h1
              style={{
                fontSize: modo === 'desktop' ? '1.75rem' : '1.4rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.25rem',
                lineHeight: 1.25,
              }}
            >
              {titulo}
            </h1>
          )}

          {contenido ? (
            <div
              className="legal-preview-content"
              style={{
                fontSize: modo === 'desktop' ? '0.9375rem' : '0.875rem',
                lineHeight: 1.75,
                color: '#374151',
              }}
              dangerouslySetInnerHTML={{ __html: contenido }}
            />
          ) : (
            <p
              style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '3rem 0',
              }}
            >
              El contenido aparecerá aquí mientras escribes...
            </p>
          )}
        </div>
      </div>

      <style>{`
        .legal-preview-content h1 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.75rem; color: #111827; }
        .legal-preview-content h2 { font-size: 1.2rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #111827; }
        .legal-preview-content h3 { font-size: 1.05rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937; }
        .legal-preview-content p { margin: 0 0 0.875rem; }
        .legal-preview-content ul, .legal-preview-content ol { margin: 0.5rem 0 1rem 1.5rem; }
        .legal-preview-content li { margin-bottom: 0.25rem; }
        .legal-preview-content strong { font-weight: 600; color: #111827; }
        .legal-preview-content em { font-style: italic; }
        .legal-preview-content a { color: #00AEEF; text-decoration: underline; }
        .legal-preview-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
        .legal-preview-content blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
      `}</style>
    </div>
  )
}
