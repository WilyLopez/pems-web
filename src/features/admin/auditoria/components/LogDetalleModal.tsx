'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ExternalLink } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { LogAuditoria, resolverRutaEntidad } from '../types'
import { useLogDetalle } from '../hooks/useLogDetalle'
import { AccionBadge } from './AccionBadge'
import { NivelBadge } from './NivelBadge'
import { ResultadoBadge } from './ResultadoBadge'

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
    /* raw string */
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <pre className="rounded-lg bg-muted/40 border border-border p-3 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
        {formatted}
      </pre>
    </div>
  )
}

function DetalleContent({ log, onClose }: { log: LogAuditoria; onClose: () => void }) {
  const router = useRouter()
  const ruta = resolverRutaEntidad(log.modulo, log.idEntidad)

  function navegar() {
    onClose()
    router.push(ruta!)
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2 items-center">
        <AccionBadge accion={log.accion} />
        <NivelBadge nivel={log.nivel} />
        <ResultadoBadge resultado={log.resultado} />
        {ruta && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-7 text-xs gap-1.5"
            onClick={navegar}
          >
            <ExternalLink className="h-3 w-3" />
            Ver registro
          </Button>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
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
            <p className="text-xs text-muted-foreground">Navegador / Dispositivo</p>
            <p className="text-xs text-muted-foreground truncate">{log.userAgent}</p>
          </div>
        )}
      </div>

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
    <Dialog open={logId !== null} onOpenChange={(v) => { if (!v) onClose() }}>
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
          <DetalleContent log={log} onClose={onClose} />
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No se pudo cargar el registro.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
