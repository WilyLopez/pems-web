'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TIPO_PERMITIDO = 'application/pdf'
const TAMANIO_MAXIMO_BYTES = 15 * 1024 * 1024

interface ContratoUploadZoneProps {
  onArchivoValido: (archivo: File) => void
  cargando?: boolean
  label?: string
}

export function ContratoUploadZone({
  onArchivoValido,
  cargando = false,
  label = 'Arrastra el PDF aquí o haz clic para seleccionarlo',
}: ContratoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)

  function validarYEmitir(archivo: File | undefined) {
    if (!archivo) return
    if (archivo.type !== TIPO_PERMITIDO) {
      toast.error('El archivo debe ser un PDF.')
      return
    }
    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      toast.error('El archivo no puede superar 15 MB.')
      return
    }
    onArchivoValido(archivo)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !cargando && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !cargando) {
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!cargando) setArrastrando(true)
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault()
        setArrastrando(false)
        if (!cargando) validarYEmitir(e.dataTransfer.files?.[0])
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors outline-none',
        cargando
          ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
          : arrastrando
            ? 'border-brand-azul bg-brand-azul/5'
            : 'border-gray-200 hover:border-brand-azul/40 hover:bg-gray-50 focus-visible:border-brand-azul'
      )}
    >
      {cargando ? (
        <Loader2 className="h-6 w-6 text-brand-azul animate-spin" />
      ) : (
        <Upload className="h-6 w-6 text-gray-400" />
      )}
      <p className="text-xs font-semibold text-gray-600">
        {cargando ? 'Subiendo…' : label}
      </p>
      <p className="text-[11px] text-gray-400">PDF, máximo 15 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={cargando}
        onChange={(e) => {
          validarYEmitir(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
