'use client'

import { LogAuditoria } from '@/types/auditoria.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { AccionBadge } from './AccionBadge'
import { NivelBadge } from './NivelBadge'
import { formatDateTime } from '@/lib/utils'
import { useLogDetalle } from '@/hooks/useAuditoria'
import { Skeleton } from '@/components/ui/Skeleton'

interface Props {
  logId: number | null
  onClose: () => void
}

function JsonBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  let formatted = value
  try {
    formatted = JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    /* raw */
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <pre className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
        {formatted}
      </pre>
    </div>
  )
}

function DetalleContent({ log }: { log: LogAuditoria }) {
  return (
    <div className="space-y-4 text-sm">
      {/* Header info */}
      <div className="flex flex-wrap gap-2">
        <AccionBadge accion={log.accion} />
        <NivelBadge nivel={log.nivel} />
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            log.resultado === 'EXITOSO'
              ? 'bg-green-100 text-green-800'
              : log.resultado === 'FALLIDO'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
          }`}
        >
          {log.resultado}
        </span>
      </div>

      <Separator />

      {/* Info general */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Usuario</p>
          <p className="font-medium">{log.nombreUsuario ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fecha y hora</p>
          <p className="font-mono text-xs">{formatDateTime(log.fechaLog)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Módulo</p>
          <p>{log.modulo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Entidad</p>
          <p>
            {log.entidadAfectada}
            {log.idEntidad ? ` #${log.idEntidad}` : ''}
          </p>
        </div>
        {log.ipOrigen && (
          <div>
            <p className="text-xs text-muted-foreground">IP origen</p>
            <p className="font-mono text-xs">{log.ipOrigen}</p>
          </div>
        )}
        {log.descripcion && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Descripción</p>
            <p>{log.descripcion}</p>
          </div>
        )}
        {log.userAgent && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">
              Navegador / Dispositivo
            </p>
            <p className="text-xs text-gray-500 truncate">{log.userAgent}</p>
          </div>
        )}
      </div>

      {/* Cambios */}
      {(log.valorAnterior || log.valorNuevo) && (
        <>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Cambios registrados
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <JsonBlock label="Antes" value={log.valorAnterior} />
            <JsonBlock label="Después" value={log.valorNuevo} />
          </div>
        </>
      )}
    </div>
  )
}

export function LogDetalleModal({ logId, onClose }: Props) {
  const { data: log, isLoading } = useLogDetalle(logId)

  return (
    <Dialog
      open={logId !== null}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Detalle del registro de auditoría
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : log ? (
          <DetalleContent log={log} />
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No se pudo cargar el registro.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
