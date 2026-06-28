'use client'

import { useRef, useState } from 'react'
import {
  History,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { galeriaService } from '@/services/galeria.service'
import {
  type AssetEntry,
  getHistory,
  addHistory,
  removeHistory,
  formatBytes,
  formatDate,
} from '../../types'

interface Props {
  label: string
  tipo: AssetEntry['tipo']
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ label, tipo, value, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<AssetEntry[]>(() => getHistory(tipo))
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen.')
      return
    }
    setUploading(true)
    try {
      const result = await galeriaService.subir(file, `${tipo}-${Date.now()}`)
      const entry: AssetEntry = {
        url: result.url,
        nombre: file.name,
        fechaSubida: result.fechaCreacion ?? new Date().toISOString(),
        tamanioBytes: result.tamanioBytes,
        tipo,
      }
      addHistory(entry)
      setHistory(getHistory(tipo))
      onChange(result.url)
      toast.success('Imagen subida.')
    } catch {
      toast.error('No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function confirmDelete(url: string) {
    removeHistory(url)
    setHistory(getHistory(tipo))
    setDeleteUrl(null)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="h-3 w-3" />
          Historial
          {history.length > 0 && (
            <span className="ml-0.5 font-medium text-brand-azul">
              ({history.length})
            </span>
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        El historial se guarda localmente en este navegador.
      </p>

      <div className="flex gap-3">
        <div className="relative w-16 h-16 rounded-xl border-2 bg-muted border-border flex items-center justify-center shrink-0 overflow-hidden">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                e.currentTarget.style.opacity = '0.2'
              }}
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>
        <div
          className={`flex-1 min-h-[64px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-all duration-150 ${
            isDragging
              ? 'border-brand-azul bg-brand-azul/5'
              : 'border-border hover:border-brand-azul/40 hover:bg-muted/40'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) upload(f)
          }}
          onClick={() => inputRef.current?.click()}
        >
          <Upload
            className={`h-4 w-4 ${isDragging ? 'text-brand-azul' : 'text-muted-foreground'}`}
          />
          <p
            className={`text-xs ${isDragging ? 'text-brand-azul font-medium' : 'text-muted-foreground'}`}
          >
            {uploading
              ? 'Subiendo...'
              : isDragging
                ? 'Suelta aquí'
                : 'Arrastra o haz clic'}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... (o sube una imagen)"
        className="h-8 text-xs font-mono"
      />

      {showHistory && (
        <div className="rounded-xl border overflow-hidden">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Sin versiones anteriores
            </p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((entry) => (
                <div
                  key={entry.url}
                  className="flex items-center gap-2.5 px-3 py-2.5"
                >
                  <div className="relative w-9 h-9 rounded-lg border border-border bg-card shrink-0 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.url}
                      alt=""
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-card-foreground">
                      {entry.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        formatBytes(entry.tamanioBytes),
                        formatDate(entry.fechaSubida),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      title="Restaurar"
                      onClick={() => {
                        onChange(entry.url)
                        toast.success('URL restaurada.')
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-brand-azul hover:bg-brand-azul/10 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      title="Eliminar del historial"
                      onClick={() => setDeleteUrl(entry.url)}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteUrl !== null}
        onOpenChange={(v) => !v && setDeleteUrl(null)}
        title="Eliminar del historial"
        description="¿Eliminar esta versión del historial local? No se borra el archivo del servidor."
        confirmLabel="Eliminar"
        onConfirm={() => deleteUrl && confirmDelete(deleteUrl)}
      />
    </div>
  )
}
