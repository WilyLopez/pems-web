'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  FileText,
  FilePen,
  CheckSquare,
  Send,
  Archive,
  XCircle,
  ExternalLink,
  Loader2,
  User,
  CalendarDays,
  Users,
  Clock,
  Pen,
  RefreshCw,
} from 'lucide-react'
import {
  useContrato,
  useActualizarContrato,
  useFirmarContrato,
  useCambiarEstadoContrato,
} from '../../hooks/useContratos'
import { EstadoContrato } from '../../types'
import { ReemplazarContratoDialog } from '../ui/ReemplazarContratoDialog'
import { InfoRow } from '@/components/common/InfoRow'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/Errorstate'
import { ContratoBadgeEstado } from '@/components/admin/contratos/ContratoBadgeEstado'
import { ContratoEditor } from '@/components/admin/contratos/ContratoEditor'
import { ContratoTimeline } from '@/components/admin/contratos/ContratoTimeline'
import { ContratoDocumentos } from '@/components/admin/contratos/ContratoDocumentos'
import { ContratoFinanzas } from '@/components/admin/contratos/ContratoFinanzas'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'
import Link from 'next/link'

type DialogType = 'firmar' | 'enviar' | 'cancelar' | 'archivar' | null

interface ContratoDetalleViewProps {
  idContrato: number
}

export function ContratoDetalleView({ idContrato }: ContratoDetalleViewProps) {
  const router = useRouter()

  const { data: contrato, isLoading, isError, refetch } = useContrato(idContrato)

  const actualizar    = useActualizarContrato()
  const firmar        = useFirmarContrato()
  const cambiarEstado = useCambiarEstadoContrato()

  const [contenido, setContenido]           = useState<string | null>(null)
  const [editando, setEditando]             = useState(false)
  const [dialog, setDialog]                 = useState<DialogType>(null)
  const [reemplazarOpen, setReemplazarOpen] = useState(false)

  const textoActual = contenido ?? contrato?.contenidoTexto ?? ''
  const esEditable  = contrato?.esEditable ?? false

  const handleGuardar = () => {
    if (!contrato || contenido === null) return
    actualizar.mutate(
      { id: contrato.id, payload: { contenidoTexto: contenido } },
      { onSuccess: () => { setEditando(false); setContenido(null) } }
    )
  }

  const handleCambiarEstado = (nuevoEstado: EstadoContrato) => {
    if (!contrato) return
    cambiarEstado.mutate(
      { id: contrato.id, payload: { nuevoEstado } },
      { onSuccess: () => setDialog(null) }
    )
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-gray-500 hover:text-brand-azul -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Contratos
        </Button>
        {contrato && (
          <>
            <span className="text-gray-300">/</span>
            <span className="font-mono text-sm text-gray-500">
              C-{String(contrato.id).padStart(4, '0')}
            </span>
          </>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-60" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {contrato && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="h-5 w-5 text-brand-azul" />
                <h1 className="text-xl font-black text-gray-900">
                  {contrato.tipoEvento ?? 'Contrato'}
                </h1>
                <ContratoBadgeEstado estado={contrato.estado} />
                <Badge variant="outline" className="text-[10px] font-mono text-gray-400">
                  v{contrato.version}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {contrato.nombreCliente}
                {contrato.fechaEvento && ` · ${formatDate(contrato.fechaEvento)}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {contrato.archivoPdfUrl && (
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5" asChild>
                  <a href={contrato.archivoPdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ver PDF
                  </a>
                </Button>
              )}
              {esEditable && !editando && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 border-brand-azul/40 text-brand-azul hover:bg-brand-azul/8"
                  onClick={() => setEditando(true)}
                >
                  <Pen className="h-4 w-4" />
                  Editar
                </Button>
              )}
              {editando && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => { setEditando(false); setContenido(null) }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
                    onClick={handleGuardar}
                    disabled={actualizar.isPending}
                  >
                    {actualizar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </>
              )}
              {esEditable && !editando && (
                <>
                  {contrato.estado !== 'ENVIADO' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setDialog('enviar')}
                    >
                      <Send className="h-4 w-4" />
                      Enviar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setDialog('firmar')}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Firmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50"
                    onClick={() => setReemplazarOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reemplazar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setDialog('cancelar')}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              )}
              {contrato.estado === 'FIRMADO' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 text-gray-500"
                  onClick={() => setDialog('archivar')}
                >
                  <Archive className="h-4 w-4" />
                  Archivar
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <ContratoEditor
                  value={textoActual}
                  onChange={setContenido}
                  contrato={contrato}
                  readOnly={!editando}
                />
              </div>

              {contrato.documentos && contrato.documentos.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Documentos asociados</h3>
                  <ContratoDocumentos documentos={contrato.documentos} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Informacion del evento</h3>
                <InfoRow icon={User}        label="Cliente"   value={contrato.nombreCliente} />
                <InfoRow icon={FileText}    label="Tipo"      value={contrato.tipoEvento} />
                <InfoRow icon={CalendarDays} label="Fecha"     value={contrato.fechaEvento ? formatDate(contrato.fechaEvento) : null} />
                <InfoRow icon={Clock}       label="Turno"     value={contrato.turno} />
                <InfoRow icon={Users}       label="Invitados" value={contrato.aforoDeclarado ? `${contrato.aforoDeclarado} personas` : null} />
                {contrato.idEventoPrivado && (
                  <>
                    <Separator />
                    <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 justify-start text-xs" asChild>
                      <Link href={ADMIN_ROUTES.eventoDetalle(contrato.idEventoPrivado)}>
                        <FilePen className="h-4 w-4" /> Ver evento asociado
                      </Link>
                    </Button>
                  </>
                )}
                {contrato.observaciones && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Observaciones</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{contrato.observaciones}</p>
                    </div>
                  </>
                )}
              </div>

              <ContratoFinanzas contrato={contrato} />

              {contrato.actividades && contrato.actividades.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Historial</h3>
                  <ContratoTimeline actividades={contrato.actividades} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={dialog === 'firmar'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Firmar contrato"
        description="Se generará el PDF y se marcará el contrato como firmado. Esta acción no puede revertirse."
        confirmLabel="Confirmar firma"
        loading={firmar.isPending}
        onConfirm={() => contrato && firmar.mutate(contrato.id, { onSuccess: () => setDialog(null) })}
      />
      <ConfirmDialog
        open={dialog === 'enviar'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Marcar como enviado"
        description="El contrato se marcará como enviado al cliente para su revisión."
        confirmLabel="Marcar como enviado"
        loading={cambiarEstado.isPending}
        onConfirm={() => handleCambiarEstado('ENVIADO')}
      />
      <ConfirmDialog
        open={dialog === 'cancelar'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Cancelar contrato"
        description="El contrato quedará cancelado. Esta acción no puede revertirse."
        confirmLabel="Cancelar contrato"
        destructive
        loading={cambiarEstado.isPending}
        onConfirm={() => handleCambiarEstado('CANCELADO')}
      />
      <ConfirmDialog
        open={dialog === 'archivar'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Archivar contrato"
        description="El contrato se moverá al archivo. Podrá consultarse pero no modificarse."
        confirmLabel="Archivar"
        loading={cambiarEstado.isPending}
        onConfirm={() => handleCambiarEstado('ARCHIVADO')}
      />

      {contrato && (
        <ReemplazarContratoDialog
          open={reemplazarOpen}
          onOpenChange={setReemplazarOpen}
          contratoId={contrato.id}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}
