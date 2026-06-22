import { useState, useRef, useEffect } from 'react'
import { getInitials, fileUrl } from '@/lib/utils'
import { Upload, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { Cliente } from '@/features/cliente/shared/types'
import { toast } from 'sonner'

interface PhotoUploadDialogProps {
  open: boolean
  onClose: () => void
  cliente: Cliente
  onUpload: (file: File) => Promise<any>
  isUploading: boolean
  onDelete: () => Promise<any>
  isDeleting: boolean
}

const FOTO_MAX_BYTES = 5 * 1024 * 1024
const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp']

export function PhotoUploadDialog({
  open,
  onClose,
  cliente,
  onUpload,
  isUploading,
  onDelete,
  isDeleting,
}: PhotoUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)

  const avatarUrl = fileUrl(cliente.fotoPerfilPath)
  const imageToShow = preview || avatarUrl

  useEffect(() => {
    if (!open) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setArchivo(null)
    }
  }, [open, preview])

  function seleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!FOTO_TIPOS.includes(file.type)) {
      toast.error('Formato no válido. Solo se aceptan JPG, PNG o WebP.')
      return
    }
    if (file.size > FOTO_MAX_BYTES) {
      toast.error('El archivo no puede superar 5 MB.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setArchivo(file)
    e.target.value = ''
  }

  async function alSubir() {
    if (archivo) {
      try {
        await onUpload(archivo)
        onClose()
      } catch {
        // Handled in query mutation onError
      }
    }
  }

  async function alEliminar() {
    try {
      await onDelete()
      onClose()
    } catch {
      // Handled in query mutation onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="text-base font-black text-gray-900">Foto de perfil</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">JPG, PNG o WebP · Máximo 5 MB</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-rosa flex items-center justify-center">
              {imageToShow ? (
                <img src={imageToShow} alt={cliente.nombreCompleto} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-black">{getInitials(cliente.nombreCompleto)}</span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={FOTO_TIPOS.join(',')}
              className="hidden"
              onChange={seleccionarArchivo}
            />

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                {preview ? 'Cambiar' : 'Seleccionar'}
              </button>
              {preview && (
                <button
                  onClick={() => {
                    if (preview) {
                      URL.revokeObjectURL(preview)
                      setPreview(null)
                      setArchivo(null)
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              )}
            </div>
          </div>

          {!preview && cliente.fotoPerfilPath && (
            <button
              onClick={alEliminar}
              disabled={isDeleting}
              className="w-full py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar foto actual'}
            </button>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={alSubir}
            disabled={!archivo || isUploading}
            className="py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-azul/90 transition-colors"
          >
            {isUploading ? 'Guardando...' : 'Guardar foto'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
