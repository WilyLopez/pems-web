'use client'

import { Image as ImageIcon, X } from 'lucide-react'

interface UploadQueueProps {
  files: File[]
  onRemove: (index: number) => void
}

export function UploadQueue({ files, onRemove }: UploadQueueProps) {
  if (files.length === 0) return null
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {files.map((f, i) => (
        <div
          key={i}
          className="relative rounded-lg border border-brand-azul/30 bg-brand-azul/5 p-2 flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4 text-brand-azul shrink-0" />
          <span className="text-xs truncate flex-1">{f.name}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="w-4 h-4 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
