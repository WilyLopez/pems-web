'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Image as ImageIcon, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { mediaService } from '@/services/media.service'

const TAMANO_MAX_BYTES = 5 * 1024 * 1024

interface Props {
  label?: string
  tipo: string
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ label, tipo, value, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function subirArchivo(file: File) {
    setUploading(true)
    try {
      const result = await mediaService.upload(file, 'logos')
      onChange(result.url)
      toast.success('Imagen subida.')
    } catch {
      toast.error('No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function solicitarSubida(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen.')
      return
    }
    if (file.size > TAMANO_MAX_BYTES) {
      toast.error('La imagen no debe superar 5 MB.')
      return
    }
    if (value) {
      setArchivoPendiente(file)
      return
    }
    subirArchivo(file)
  }

  function confirmarReemplazo() {
    if (archivoPendiente) subirArchivo(archivoPendiente)
    setArchivoPendiente(null)
  }

  return (
    <div className="space-y-2.5">
      {label && <Label className="font-medium">{label}</Label>}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={!value}
          onClick={() => setPreviewOpen(true)}
          className="group relative w-16 h-16 rounded-xl border-2 bg-muted border-border flex items-center justify-center shrink-0 overflow-hidden disabled:cursor-default"
        >
          {value ? (
            <>
              <Image
                src={value}
                alt={label ?? tipo}
                fill
                unoptimized
                sizes="64px"
                className="object-contain p-1.5"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </>
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          )}
        </button>
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
            if (f) solicitarSubida(f)
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
              if (f) solicitarSubida(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
          Quitar imagen
        </button>
      )}

      {value && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogTitle>{label ?? tipo}</DialogTitle>
            <div className="relative h-72 w-full rounded-lg bg-muted overflow-hidden">
              <Image
                src={value}
                alt={label ?? tipo}
                fill
                unoptimized
                sizes="512px"
                className="object-contain p-4"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={archivoPendiente !== null}
        onOpenChange={(open) => !open && setArchivoPendiente(null)}
        title="Reemplazar imagen"
        description="Ya hay una imagen cargada aquí. ¿Quieres reemplazarla por la nueva?"
        confirmLabel="Reemplazar"
        destructive={false}
        onConfirm={confirmarReemplazo}
      />
    </div>
  )
}
