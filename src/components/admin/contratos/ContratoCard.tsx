'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Download,
  User,
  CalendarDays,
  Users,
  Clock,
  FilePen,
} from 'lucide-react'
import { useContratoPorEvento, useCargarContrato } from '@/features/admin/contratos/hooks/useContratos'
import { ContratoUploadZone } from './ContratoUploadZone'
import { ContratoTimeline } from './ContratoTimeline'
import { ContratoFinanzas } from './ContratoFinanzas'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { InfoRow } from '@/components/common/InfoRow'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { downloadFile } from '@/utils/download.utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'

interface ContratoCardProps {
  idEvento: number
  mostrarEnlaceEvento?: boolean
}

export function ContratoCard({
  idEvento,
  mostrarEnlaceEvento = false,
}: ContratoCardProps) {
  const { data: contrato, isLoading } = useContratoPorEvento(idEvento)
  const cargar = useCargarContrato()

  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const [confirmarReemplazo, setConfirmarReemplazo] = useState(false)
  const [descargando, setDescargando] = useState(false)

  function handleArchivoSeleccionado(archivo: File) {
    if (contrato) {
      setArchivoPendiente(archivo)
      setConfirmarReemplazo(true)
      return
    }
    cargar.mutate({ idEvento, archivo })
  }

  function handleConfirmarReemplazo() {
    if (!archivoPendiente) return
    cargar.mutate(
      { idEvento, archivo: archivoPendiente },
      {
        onSuccess: () => {
          setConfirmarReemplazo(false)
          setArchivoPendiente(null)
        },
      }
    )
  }

  async function handleDescargar() {
    setDescargando(true)
    try {
      await downloadFile(
        `/contratos/eventos/${idEvento}/descargar`,
        `contrato-evento-${idEvento}.pdf`
      )
    } finally {
      setDescargando(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-azul/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-brand-azul" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            Contrato del evento
          </h3>
        </div>

        {!contrato ? (
          <ContratoUploadZone
            label="Arrastra el PDF del contrato aquí o haz clic para seleccionarlo"
            cargando={cargar.isPending}
            onArchivoValido={handleArchivoSeleccionado}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                Cargado por{' '}
                <span className="font-semibold text-gray-800">
                  {contrato.usuarioCarga ?? 'un administrador'}
                </span>
                {contrato.fechaCarga && (
                  <> · {formatDateTime(contrato.fechaCarga)}</>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5"
                onClick={handleDescargar}
                disabled={descargando}
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </Button>
            </div>

            <ContratoUploadZone
              label="Arrastra un nuevo PDF para reemplazar el contrato actual"
              cargando={cargar.isPending}
              onArchivoValido={handleArchivoSeleccionado}
            />
          </div>
        )}
      </div>

      {contrato && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              Información del evento
            </h3>
            <InfoRow icon={User} label="Cliente" value={contrato.nombreCliente} />
            <InfoRow icon={FileText} label="Tipo" value={contrato.tipoEvento} />
            <InfoRow
              icon={CalendarDays}
              label="Fecha"
              value={
                contrato.fechaEvento ? formatDate(contrato.fechaEvento) : null
              }
            />
            <InfoRow icon={Clock} label="Turno" value={contrato.turno} />
            <InfoRow
              icon={Users}
              label="Invitados"
              value={
                contrato.aforoDeclarado
                  ? `${contrato.aforoDeclarado} personas`
                  : null
              }
            />
            {mostrarEnlaceEvento && (
              <>
                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl gap-1.5 justify-start text-xs"
                  asChild
                >
                  <Link href={ADMIN_ROUTES.eventoDetalle(idEvento)}>
                    <FilePen className="h-4 w-4" /> Ver evento asociado
                  </Link>
                </Button>
              </>
            )}
          </div>

          <ContratoFinanzas contrato={contrato} />

          {contrato.actividades && contrato.actividades.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Historial</h3>
              <ContratoTimeline actividades={contrato.actividades} />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmarReemplazo}
        onOpenChange={(o) => {
          if (!o) {
            setConfirmarReemplazo(false)
            setArchivoPendiente(null)
          }
        }}
        title="Reemplazar contrato"
        description="El archivo actual será reemplazado de forma permanente. Esta acción no puede revertirse."
        confirmLabel="Reemplazar"
        destructive
        loading={cargar.isPending}
        onConfirm={handleConfirmarReemplazo}
      />
    </div>
  )
}
