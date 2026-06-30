'use client'

import { useEffect, useState } from 'react'
import { Hash, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useHistorialLegal } from '@/features/admin/cms/legal/hooks/useContenidoLegal'
import { formatDateTime, cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  tipo: string
}

export function LegalHistorialModal({ open, onClose, tipo }: Props) {
  const { data: versiones, isLoading } = useHistorialLegal(tipo, open)
  const [seleccionada, setSeleccionada] = useState<number | null>(null)

  useEffect(() => {
    if (!open) setSeleccionada(null)
  }, [open])

  const actual = versiones?.find((v) => v.id === seleccionada) ?? versiones?.[0]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de versiones</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-40 rounded" />
          </div>
        ) : !versiones || versiones.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay versiones anteriores. El historial se genera al guardar
            cambios.
          </div>
        ) : (
          <div className="grid grid-cols-[200px_1fr] gap-4 max-h-[60vh]">
            <div className="overflow-auto border-r pr-2 space-y-1">
              {versiones.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSeleccionada(v.id)}
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-2 transition-colors',
                    (actual?.id === v.id)
                      ? 'bg-brand-azul/10'
                      : 'hover:bg-muted/60'
                  )}
                >
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Hash className="h-3 w-3" /> Versión {v.version}
                  </span>
                  {v.fechaCreacion && (
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(v.fechaCreacion)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-auto">
              {actual && (
                <>
                  <h3 className="text-sm font-bold text-foreground">
                    {actual.titulo}
                  </h3>
                  <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                    {actual.contenido}
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
