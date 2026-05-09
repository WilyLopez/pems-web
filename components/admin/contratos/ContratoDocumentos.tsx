'use client'

import { FileText, Download, Trash2, Upload, Loader2 } from 'lucide-react'
import { DocumentoContrato } from '@/types/contrato.types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ContratoDocumentosProps {
  documentos:    DocumentoContrato[]
  onEliminar?:   (id: number) => void
  eliminandoId?: number | null
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const TIPO_ICON: Record<string, string> = {
  PDF:   'bg-red-100 text-red-700',
  DOCX:  'bg-blue-100 text-blue-700',
  IMAGE: 'bg-green-100 text-green-700',
}

export function ContratoDocumentos({
  documentos,
  onEliminar,
  eliminandoId,
}: ContratoDocumentosProps) {
  if (!documentos.length) {
    return (
      <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
        <Upload className="h-6 w-6 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">Sin documentos adjuntos</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documentos.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2.5 hover:border-brand-azul/30 transition-colors"
        >
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
            TIPO_ICON[doc.tipoArchivo.toUpperCase()] ?? 'bg-gray-100 text-gray-600',
          )}>
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{doc.nombre}</p>
            <p className="text-[10px] text-gray-400">
              {doc.tipoArchivo} &middot; {formatBytes(doc.tamanobytes)} &middot; {doc.usuarioCarga}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul"
              asChild
            >
              <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-3.5 w-3.5" />
              </a>
            </Button>
            {onEliminar && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-destructive"
                onClick={() => onEliminar(doc.id)}
                disabled={eliminandoId === doc.id}
              >
                {eliminandoId === doc.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}