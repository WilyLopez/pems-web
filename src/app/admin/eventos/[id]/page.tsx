'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  PartyPopper,
  User,
  CalendarDays,
  Users,
  Clock,
  CreditCard,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import {
  useEvento,
  useChecklist,
  useCompletarTarea,
  useDescompletarTarea,
  useCompletarEvento,
  useRegistrarSaldo,
  useCancelarEvento,
} from '@/hooks/useEventos'
import { useResumenEvento, GastosEventoPanel, PresupuestoEventoSection } from '@/features/admin/finance'
import { ConfirmarEventoModal } from '@/components/admin/eventos/ConfirmarEventoModal'
import { ContratoEventoTab } from '@/components/admin/contratos/ContratoEventoTab'
import { calcularIndicadores } from '@/types/evento.types'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import Link from 'next/link'

const ESTADO_BADGE: Record<string, string> = {
  SOLICITADA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  COMPLETADA: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELADA:  'bg-red-100 text-red-700 border-red-200',
}

const MEDIOS_PAGO = [
  { value: 'EFECTIVO',       label: 'Efectivo' },
  { value: 'YAPE',           label: 'Yape' },
  { value: 'TRANSFERENCIA',  label: 'Transferencia' },
  { value: 'TARJETA',        label: 'Tarjeta' },
]

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null | React.ReactNode
}) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default function EventoDetallePage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const idNum   = parseInt(id)

  const { data: evento, isLoading, isError, refetch } = useEvento(idNum)
  const { data: checklist = [], isLoading: loadingChecklist } = useChecklist(idNum)
  const { data: resumenFinanciero } = useResumenEvento(idNum)

  const completar       = useCompletarTarea()
  const descompletar    = useDescompletarTarea()
  const completarEvento = useCompletarEvento()
  const registrarSaldo  = useRegistrarSaldo()
  const cancelarEvento  = useCancelarEvento()

  const [modalConfirmar, setModalConfirmar]       = useState(false)
  const [dialogCompletar, setDialogCompletar]     = useState(false)
  const [dialogCancelar, setDialogCancelar]       = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [montoSaldo, setMontoSaldo]               = useState('')
  const [medioPagoSaldo, setMedioPagoSaldo]       = useState('')

  const completadas  = checklist.filter((c) => c.completada).length
  const pctChecklist = checklist.length > 0
    ? Math.round((completadas / checklist.length) * 100) : 0

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
          Eventos
        </Button>
        {evento && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500 truncate">{evento.tipoEvento}</span>
          </>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-72" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2"><Skeleton className="h-96 rounded-2xl" /></div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      )}

      {evento && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-brand-rosa" />
                <h1 className="text-xl font-black text-gray-900">{evento.tipoEvento}</h1>
                <Badge
                  variant="outline"
                  className={cn('text-xs font-bold', ESTADO_BADGE[evento.estado])}
                >
                  {evento.estado}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {evento.nombreCliente} · {formatDate(evento.fechaEvento)}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {evento.estado === 'SOLICITADA' && (
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setModalConfirmar(true)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar evento
                </Button>
              )}

              {evento.estado === 'CONFIRMADA' && (
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
                  onClick={() => setDialogCompletar(true)}
                  disabled={completarEvento.isPending}
                >
                  {completarEvento.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />}
                  Marcar completado
                </Button>
              )}

              {(evento.estado === 'SOLICITADA' || evento.estado === 'CONFIRMADA') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDialogCancelar(true)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {calcularIndicadores(evento).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {calcularIndicadores(evento).map((ind, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold',
                    ind.nivel === 'DANGER'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  )}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {ind.mensaje}
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="resumen">
                <TabsList className="bg-gray-100 rounded-xl p-1">
                  <TabsTrigger value="resumen" className="rounded-lg text-xs">Resumen</TabsTrigger>
                  <TabsTrigger value="pagos" className="rounded-lg text-xs">Pagos</TabsTrigger>
                  <TabsTrigger value="presupuesto" className="rounded-lg text-xs">Presupuesto</TabsTrigger>
                  <TabsTrigger value="checklist" className="rounded-lg text-xs">
                    Checklist
                    {pctChecklist < 100 && checklist.length > 0 && (
                      <span className="ml-1 bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 rounded-full">
                        {completadas}/{checklist.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contrato" className="rounded-lg text-xs">
                    Contrato
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="mt-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Datos del evento</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow icon={User}        label="Cliente" value={evento.nombreCliente} />
                      <InfoRow icon={CalendarDays} label="Fecha"   value={formatDate(evento.fechaEvento)} />
                      <InfoRow icon={Clock}       label="Turno"   value={`${evento.turno} · ${evento.horaInicio} - ${evento.horaFin}`} />
                      <InfoRow icon={Users}       label="Aforo"   value={evento.aforoDeclarado ? `${evento.aforoDeclarado} personas` : null} />
                    </div>
                    {(evento.nombreNino || evento.observaciones || evento.contactoAdicional) && (
                      <>
                        <Separator />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoRow icon={User} label="Nombre del niño"  value={evento.nombreNino} />
                          <InfoRow icon={User} label="Edad"              value={evento.edadCumple ? `${evento.edadCumple} años` : null} />
                          <InfoRow icon={User} label="Contacto adicional" value={evento.contactoAdicional} />
                        </div>
                      </>
                    )}
                    {evento.observaciones && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Observaciones</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{evento.observaciones}</p>
                        </div>
                      </>
                    )}
                    {evento.extras && evento.extras.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Extras solicitados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {evento.extras.map((ex) => (
                              <span key={ex.id} className="text-xs bg-brand-rosa/10 text-brand-rosa px-2 py-0.5 rounded-full font-medium">
                                {ex.nombreExtra ?? ex.nombreLibre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pagos" className="mt-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Estado financiero</h3>
                    {evento.precioTotalContrato ? (
                      <>
                        <div className="space-y-3">
                          {[
                            { label: 'Total contratado',   value: evento.precioTotalContrato, cls: 'text-gray-900' },
                            { label: 'Adelanto recibido',  value: evento.montoAdelanto ?? 0,  cls: 'text-green-700' },
                          ].map(({ label, value, cls }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">{label}</span>
                              <span className={cn('text-sm font-black', cls)}>{formatCurrency(value)}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Saldo pendiente</span>
                            <span className={cn('text-lg font-black', (evento.montoSaldo ?? 0) > 0 ? 'text-amber-700' : 'text-green-700')}>
                              {formatCurrency(evento.montoSaldo ?? 0)}
                            </span>
                          </div>
                        </div>

                        {evento.medioPago && (
                          <p className="text-xs text-gray-400">
                            Medio de pago adelanto: <span className="font-semibold">{evento.medioPago}</span>
                          </p>
                        )}

                        {evento.estado === 'CONFIRMADA' && (evento.montoSaldo ?? 0) > 0 && (
                          <div className="border-t border-gray-100 pt-4 space-y-3">
                            <h4 className="text-sm font-bold text-gray-900">Registrar pago del saldo</h4>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Monto S/"
                                value={montoSaldo}
                                onChange={(e) => setMontoSaldo(e.target.value)}
                                className="h-9 rounded-lg text-sm"
                              />
                              <Select onValueChange={setMedioPagoSaldo}>
                                <SelectTrigger className="h-9 rounded-lg w-44 text-sm">
                                  <SelectValue placeholder="Medio de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEDIOS_PAGO.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="rounded-lg bg-brand-azul hover:bg-brand-azul/90 text-white shrink-0 gap-1.5"
                                disabled={!montoSaldo || !medioPagoSaldo || registrarSaldo.isPending}
                                onClick={() => {
                                  if (!montoSaldo || !medioPagoSaldo) return
                                  registrarSaldo.mutate(
                                    { id: idNum, monto: parseFloat(montoSaldo), medioPago: medioPagoSaldo },
                                    { onSuccess: () => { setMontoSaldo(''); setMedioPagoSaldo('') } }
                                  )
                                }}
                              >
                                {registrarSaldo.isPending
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <CreditCard className="h-3.5 w-3.5" />}
                                Registrar
                              </Button>
                            </div>
                          </div>
                        )}

                        {resumenFinanciero && (
                          <>
                            <Separator />
                            <GastosEventoPanel idEvento={idNum} resumen={resumenFinanciero} />
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">
                        El precio del contrato aun no ha sido definido.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="presupuesto" className="mt-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <PresupuestoEventoSection idEvento={idNum} />
                  </div>
                </TabsContent>

                <TabsContent value="contrato" className="mt-4">
                  <ContratoEventoTab idEvento={idNum} evento={evento} />
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Checklist operativo</h3>
                      <span className={cn('text-xs font-bold px-2 py-1 rounded-full',
                        pctChecklist === 100 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>
                        {completadas}/{checklist.length} completadas
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={cn('h-2 rounded-full transition-all', pctChecklist === 100 ? 'bg-green-500' : 'bg-amber-400')}
                        style={{ width: `${pctChecklist}%` }}
                      />
                    </div>
                    {loadingChecklist ? (
                      <Skeleton className="h-32 rounded-xl" />
                    ) : (
                      <div className="space-y-2">
                        {checklist.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                              item.completada ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-brand-azul/30'
                            )}
                            onClick={() => {
                              if (completar.isPending || descompletar.isPending) return
                              if (item.completada) {
                                descompletar.mutate({ idEvento: idNum, idChecklist: item.id })
                              } else {
                                completar.mutate({ idEvento: idNum, idChecklist: item.id })
                              }
                            }}
                          >
                            {item.completada
                              ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              : <Circle className="h-5 w-5 text-gray-300 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-semibold',
                                item.completada ? 'line-through text-gray-400' : 'text-gray-900')}>
                                {item.tarea}
                              </p>
                              {item.completada && item.usuarioCompleto && (
                                <p className="text-[10px] text-gray-400">{item.usuarioCompleto}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Cliente</h3>
                <InfoRow icon={User} label="Nombre"   value={evento.nombreCliente} />
                <InfoRow icon={User} label="Correo"   value={evento.correoCliente} />
                <InfoRow icon={User} label="Telefono" value={evento.telefonoCliente} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Acciones rapidas</h3>
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 justify-start text-xs" asChild>
                  <Link href={`/admin/reservas?fecha=${evento.fechaEvento}`}>
                    <CalendarDays className="h-4 w-4" /> Ver reservas del dia
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {evento && (
        <ConfirmarEventoModal
          evento={evento}
          open={modalConfirmar}
          onClose={() => setModalConfirmar(false)}
        />
      )}

      <ConfirmDialog
        open={dialogCompletar}
        onOpenChange={(o) => !o && setDialogCompletar(false)}
        title="Marcar evento como completado"
        description="El evento pasará a estado COMPLETADA. Esta acción no puede revertirse."
        confirmLabel="Marcar completado"
        loading={completarEvento.isPending}
        onConfirm={() =>
          completarEvento.mutate(idNum, { onSuccess: () => setDialogCompletar(false) })
        }
      />

      <Dialog open={dialogCancelar} onOpenChange={(o) => !o && setDialogCancelar(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Cancelar evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Esta acción no puede revertirse. Ingresa el motivo de cancelación.
            </p>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Motivo de cancelación..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogCancelar(false)}
              disabled={cancelarEvento.isPending}
            >
              Volver
            </Button>
            <Button
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5"
              disabled={!motivoCancelacion.trim() || cancelarEvento.isPending}
              onClick={() => {
                if (!motivoCancelacion.trim()) return
                cancelarEvento.mutate(
                  { id: idNum, motivo: motivoCancelacion },
                  { onSuccess: () => setDialogCancelar(false) }
                )
              }}
            >
              {cancelarEvento.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancelar evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
