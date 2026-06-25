'use client'

import { useRef } from 'react'
import {
  FileText,
  Upload,
  Plus,
  ExternalLink,
  Pen,
  Send,
  CheckSquare,
  XCircle,
  Archive,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import {
  useContratoPorEvento,
  useGenerarContrato,
  useActualizarContrato,
  useFirmarContrato,
  useCambiarEstadoContrato,
  useSubirDocumento,
} from '@/features/admin/contratos/hooks/useContratos'
import { contratosKeys } from '@/features/admin/contratos/shared/queryKeys'
import { EstadoContrato } from '@/features/admin/contratos/types'
import { ContratoEditor } from './ContratoEditor'
import { ContratoDocumentos } from './ContratoDocumentos'
import { ContratoTimeline } from './ContratoTimeline'
import { ContratoFinanzas } from './ContratoFinanzas'
import { ContratoBadgeEstado } from './ContratoBadgeEstado'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useQueryClient } from '@tanstack/react-query'

type DialogType = 'firmar' | 'enviar' | 'cancelar' | 'archivar' | null

interface EventoCtx {
  nombreCliente?: string
  tipoEvento?: string
  fechaEvento?: string
  turno?: string
  aforoDeclarado?: number
  precioTotalContrato?: number | null
  montoAdelanto?: number | null
  montoSaldo?: number | null
}

interface ContratoEventoTabProps {
  idEvento: number
  evento?: EventoCtx
}

export function ContratoEventoTab({ idEvento }: ContratoEventoTabProps) {
  const qc         = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: contrato, isLoading } = useContratoPorEvento(idEvento)

  const generar       = useGenerarContrato()
  const actualizar    = useActualizarContrato()
  const firmar        = useFirmarContrato()
  const cambiarEstado = useCambiarEstadoContrato()
  const subirDoc      = useSubirDocumento()

  const [contenido, setContenido]   = useState<string | null>(null)
  const [editando, setEditando]     = useState(false)
  const [dialog, setDialog]         = useState<DialogType>(null)
  const subirInputRef               = useRef<HTMLInputElement>(null)

  const textoActual = contenido ?? contrato?.contenidoTexto ?? ''
  const esEditable  = contrato?.esEditable ?? false

  function invalidarContrato() {
    qc.invalidateQueries({ queryKey: contratosKeys.porEvento(idEvento) })
  }

  function handleCrear() {
    generar.mutate({ idEvento }, { onSuccess: () => invalidarContrato() })
  }

  function handleSubir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !contrato) return
    subirDoc.mutate({ id: contrato.id, archivo: file }, { onSuccess: () => invalidarContrato() })
    e.target.value = ''
  }

  function handleCrearYSubir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    generar.mutate(
      { idEvento },
      {
        onSuccess: (nuevoContrato) => {
          subirDoc.mutate(
            { id: nuevoContrato.id, archivo: file },
            { onSuccess: () => invalidarContrato() }
          )
        },
      }
    )
    e.target.value = ''
  }

  function handleGuardar() {
    if (!contrato || contenido === null) return
    actualizar.mutate(
      { id: contrato.id, payload: { contenidoTexto: contenido } },
      { onSuccess: () => { setEditando(false); setContenido(null) } }
    )
  }

  function handleCambiarEstado(nuevoEstado: EstadoContrato) {
    if (!contrato) return
    cambiarEstado.mutate(
      { id: contrato.id, payload: { nuevoEstado } },
      { onSuccess: () => setDialog(null) }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <FileText className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Sin contrato asociado</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Crea un borrador para redactar el contrato, o sube directamente el PDF firmado.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={handleCrear}
              disabled={generar.isPending || subirDoc.isPending}
            >
              {generar.isPending && !subirDoc.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Plus className="h-4 w-4" />}
              Crear borrador
            </Button>
            <label className="cursor-pointer">
              <Button
                size="sm"
                className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5 pointer-events-none"
                disabled={generar.isPending || subirDoc.isPending}
                asChild
              >
                <span>
                  {subirDoc.isPending || generar.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Upload className="h-4 w-4" />}
                  Subir PDF firmado
                </span>
              </Button>
              <input
                ref={subirInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleCrearYSubir}
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ContratoBadgeEstado estado={contrato.estado} />
          <Badge variant="outline" className="text-[10px] font-mono text-gray-400">
            v{contrato.version}
          </Badge>
          {contrato.archivoPdfUrl && (
            <a
              href={contrato.archivoPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-azul hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver PDF
            </a>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {esEditable && !editando && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 border-brand-azul/40 text-brand-azul hover:bg-brand-azul/8"
                onClick={() => setEditando(true)}
              >
                <Pen className="h-4 w-4" />
                Editar
              </Button>
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
                className="rounded-xl gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setDialog('cancelar')}
              >
                <XCircle className="h-4 w-4" />
                Cancelar
              </Button>
              <label className="cursor-pointer">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 pointer-events-none"
                  asChild
                >
                  <span>
                    {subirDoc.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Upload className="h-4 w-4" />}
                    Adjuntar
                  </span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleSubir}
                />
              </label>
            </>
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

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <ContratoEditor
          value={textoActual}
          onChange={setContenido}
          contrato={contrato}
          readOnly={!editando}
        />
      </div>

      {contrato.documentos && contrato.documentos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Documentos asociados</h3>
          <ContratoDocumentos documentos={contrato.documentos} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ContratoFinanzas contrato={contrato} />
        {contrato.actividades && contrato.actividades.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Historial</h3>
            <ContratoTimeline actividades={contrato.actividades} />
          </div>
        )}
      </div>

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
    </div>
  )
}
