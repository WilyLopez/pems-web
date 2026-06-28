'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  User,
  CalendarDays,
  Users,
  Clock,
  CreditCard,
  CheckCircle2,
  Circle,
  Loader2,
  MessageCircle,
  FileText,
  TrendingUp,
  CalendarClock,
  XCircle,
  Plus,
  ExternalLink,
  Banknote,
  Package,
} from 'lucide-react'
import {
  useEvento,
  useChecklist,
  useCompletarTarea,
  useDescompletarTarea,
  useCompletarEvento,
  useRegistrarSaldo,
  useCancelarEvento,
  useRegistrarPagoCuota,
  useAgregarTarea,
  useEliminarTarea,
} from '../../hooks/useEventos'
import { calcularIndicadores, EventoCuota, PagoItem } from '../../types'
import { EventoEstadoBadge } from '../ui/EventoEstadoBadge'
import { EventoAlertasBadges } from '../ui/EventoAlertasBadges'
import { MediosPagoSelect } from '@/features/admin/config/components/MediosPagoSelect'
import { useResumenEvento, GastosEventoPanel } from '@/features/admin/finanzas'
import { usePaquete } from '@/hooks/useComercial'
import { ConfirmarEventoModal } from '@/components/admin/eventos/ConfirmarEventoModal'
import { ContratoEventoTab } from '@/components/admin/contratos/ContratoEventoTab'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoRow } from '@/components/common/InfoRow'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
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
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'
import Link from 'next/link'
import { MultiMedioPago } from '../forms/MultiMedioPago'

const ORIGEN_LABELS: Record<string, string> = {
  PRESENCIAL: 'Presencial',
  TELEFONO: 'Teléfono',
  WHATSAPP: 'WhatsApp',
  WEB: 'Web',
}

interface EventoDetalleViewProps {
  idEvento: number
}

export function EventoDetalleView({ idEvento }: EventoDetalleViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabActivo = searchParams.get('tab') ?? 'resumen'

  function setTab(tab: string) {
    router.replace(`/admin/eventos/${idEvento}?tab=${tab}`)
  }

  const { data: evento, isLoading, isError, refetch } = useEvento(idEvento)
  const { data: checklist = [], isLoading: loadingChecklist } = useChecklist(idEvento)
  const { data: resumenFinanciero } = useResumenEvento(idEvento)
  const { data: paquete } = usePaquete(evento?.idPaquete ?? undefined)

  const completar = useCompletarTarea()
  const descompletar = useDescompletarTarea()
  const agregarTarea = useAgregarTarea()
  const eliminarTarea = useEliminarTarea()
  const completarEvento = useCompletarEvento()
  const registrarSaldo = useRegistrarSaldo()
  const cancelarEvento = useCancelarEvento()
  const registrarCuota = useRegistrarPagoCuota()

  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [dialogCompletar, setDialogCompletar] = useState(false)
  const [dialogCancelar, setDialogCancelar] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [montoSaldo, setMontoSaldo] = useState('')
  const [medioPagoSaldo, setMedioPagoSaldo] = useState('')
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<EventoCuota | null>(null)
  const [pagosCuota, setPagosCuota] = useState<PagoItem[]>([{ medioPago: '', monto: 0 }])
  const [dialogReprogramar, setDialogReprogramar] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState('')

  const completadas = checklist.filter((c) => c.completada).length
  const pctChecklist = checklist.length > 0
    ? Math.round((completadas / checklist.length) * 100) : 0
  const hoy = new Date().toISOString().slice(0, 10)
  const eventoFuturo = !!evento && String(evento.fechaEvento) > hoy

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[
        { label: 'Eventos', href: '/admin/eventos' },
        ...(evento ? [{ label: evento.tipoEvento }] : []),
      ]} />

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
          <PageHeader
            className="mb-0"
            title={evento.tipoEvento}
            description={`${evento.nombreCliente} · ${formatDate(evento.fechaEvento)}`}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <EventoEstadoBadge estado={evento.estado} />
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
                    disabled={completarEvento.isPending || eventoFuturo}
                    title={eventoFuturo ? `Disponible a partir del ${formatDate(evento.fechaEvento)}` : undefined}
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
            }
          />

          {calcularIndicadores(evento).length > 0 && (
            <div className="flex flex-wrap gap-2">
              <EventoAlertasBadges evento={evento} variant="badges" />
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs value={tabActivo} onValueChange={setTab}>
                <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <TabsTrigger value="resumen" className="rounded-lg text-xs">Resumen</TabsTrigger>
                  <TabsTrigger value="pagos" className="rounded-lg text-xs">Pagos</TabsTrigger>
                  <TabsTrigger value="rentabilidad" className="rounded-lg text-xs">Rentabilidad</TabsTrigger>
                  <TabsTrigger value="checklist" className="rounded-lg text-xs">
                    Checklist
                    {pctChecklist < 100 && checklist.length > 0 && (
                      <span className="ml-1 bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 rounded-full">
                        {completadas}/{checklist.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contrato" className="rounded-lg text-xs">Contrato</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="mt-4 space-y-4">
                  {evento.estado === 'CANCELADA' && evento.motivoCancelacion && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-red-500 dark:text-red-400 mb-1">Motivo de cancelación</p>
                        <p className="text-sm text-red-800 dark:text-red-300">{evento.motivoCancelacion}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Datos del evento</h3>
                      {evento.esCotizacionPersonalizada && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul bg-brand-azul/10 px-2.5 py-1 rounded-full shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                          Cotización personalizada
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow icon={User} label="Cliente" value={evento.nombreCliente} />
                      <InfoRow icon={CalendarDays} label="Fecha" value={formatDate(evento.fechaEvento)} />
                      <InfoRow icon={Clock} label="Turno" value={`${evento.turno} · ${evento.horaInicio} - ${evento.horaFin}`} />
                      <InfoRow icon={Users} label="Aforo" value={evento.aforoDeclarado ? `${evento.aforoDeclarado} personas` : null} />
                      {paquete && (
                        <InfoRow icon={Package} label="Paquete" value={paquete.nombre} />
                      )}
                      {evento.origenContacto && (
                        <InfoRow icon={MessageCircle} label="Canal de contacto" value={ORIGEN_LABELS[evento.origenContacto] ?? evento.origenContacto} />
                      )}
                      {evento.presupuestoEstimado && (
                        <InfoRow icon={Banknote} label="Presupuesto cliente" value={formatCurrency(evento.presupuestoEstimado)} />
                      )}
                    </div>
                    {(evento.nombreNino || evento.contactoAdicional) && (
                      <>
                        <Separator />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoRow icon={User} label="Nombre del niño" value={evento.nombreNino} />
                          <InfoRow icon={User} label="Edad" value={evento.edadCumple ? `${evento.edadCumple} años` : null} />
                          <InfoRow icon={User} label="Contacto adicional" value={evento.contactoAdicional} />
                        </div>
                      </>
                    )}
                    {evento.descripcionPersonalizada && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Descripción del cliente</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{evento.descripcionPersonalizada}</p>
                        </div>
                      </>
                    )}
                    {evento.observaciones && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Observaciones</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{evento.observaciones}</p>
                        </div>
                      </>
                    )}
                    {evento.extras && evento.extras.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Extras solicitados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {evento.extras.map((ex) =>
                              ex.idExtra ? (
                                <span key={ex.id} className="text-xs bg-brand-rosa/10 text-brand-rosa px-2 py-0.5 rounded-full font-medium">
                                  {ex.nombreExtra}
                                </span>
                              ) : (
                                <span key={ex.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium border border-dashed border-gray-300 dark:border-gray-600">
                                  {ex.nombreLibre}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {evento.estado === 'COMPLETADA' && (evento.horaInicioReal || evento.horaFinReal) && (
                      <>
                        <Separator />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoRow icon={Clock} label="Inicio real" value={evento.horaInicioReal ? formatDate(evento.horaInicioReal, 'HH:mm') : null} />
                          <InfoRow icon={Clock} label="Fin real" value={evento.horaFinReal ? formatDate(evento.horaFinReal, 'HH:mm') : null} />
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pagos" className="mt-4">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Estado financiero</h3>
                    {evento.precioTotalContrato ? (
                      <>
                        <div className="space-y-3">
                          {[
                            { label: 'Total contratado', value: evento.precioTotalContrato, cls: 'text-gray-900 dark:text-gray-100' },
                            { label: 'Adelanto recibido', value: evento.montoAdelanto ?? 0, cls: 'text-green-700 dark:text-green-400' },
                          ].map(({ label, value, cls }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                              <span className={cn('text-sm font-black', cls)}>{formatCurrency(value)}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Saldo pendiente</span>
                            <span className={cn('text-lg font-black', (evento.montoSaldo ?? 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400')}>
                              {formatCurrency(evento.montoSaldo ?? 0)}
                            </span>
                          </div>
                        </div>

                        {evento.modalidadPago === 'CUOTAS' && evento.cuotas && evento.cuotas.length > 0 ? (
                          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Plan de cuotas</h4>
                              {evento.fechaLimitePago && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  Vence {formatDate(evento.fechaLimitePago)}
                                </span>
                              )}
                            </div>
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                              {evento.cuotas.map((cuota) => (
                                <div
                                  key={cuota.id}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0',
                                    cuota.estado === 'PAGADO' && 'bg-green-50/50 dark:bg-green-950/20'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                                      cuota.estado === 'PAGADO'
                                        ? 'bg-green-500 text-white'
                                        : cuota.estado === 'VENCIDO'
                                          ? 'bg-red-500 text-white'
                                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    )}
                                  >
                                    {cuota.numeroCuota}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {cuota.estado === 'PAGADO' && cuota.numeroCuota === 1
                                        ? 'Adelanto · hoy'
                                        : formatDate(cuota.fechaVencimiento)}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                                    {formatCurrency(cuota.monto)}
                                  </span>
                                  <span
                                    className={cn(
                                      'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                                      cuota.estado === 'PAGADO'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : cuota.estado === 'VENCIDO'
                                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    )}
                                  >
                                    {cuota.estado}
                                  </span>
                                  {cuota.estado !== 'PAGADO' && evento.estado === 'CONFIRMADA' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs rounded-lg shrink-0 border-brand-azul text-brand-azul hover:bg-brand-azul/5"
                                      onClick={() => {
                                        setCuotaSeleccionada(cuota)
                                        setPagosCuota([{ medioPago: '', monto: cuota.monto }])
                                      }}
                                    >
                                      Pagar
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {evento.medioPago && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Medio de pago adelanto: <span className="font-semibold">{evento.medioPago}</span>
                              </p>
                            )}
                            {evento.estado === 'CONFIRMADA' && (evento.montoSaldo ?? 0) > 0 && (
                              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Registrar pago del saldo</h4>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Monto S/"
                                    value={montoSaldo}
                                    onChange={(e) => setMontoSaldo(e.target.value)}
                                    className="h-9 rounded-lg text-sm"
                                  />
                                  <MediosPagoSelect
                                    value={medioPagoSaldo}
                                    onValueChange={setMedioPagoSaldo}
                                    placeholder="Medio de pago"
                                    className="h-9 rounded-lg w-44 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    className="rounded-lg bg-brand-azul hover:bg-brand-azul/90 text-white shrink-0 gap-1.5"
                                    disabled={!montoSaldo || !medioPagoSaldo || registrarSaldo.isPending}
                                    onClick={() => {
                                      if (!montoSaldo || !medioPagoSaldo) return
                                      registrarSaldo.mutate(
                                        { id: idEvento, monto: parseFloat(montoSaldo), medioPago: medioPagoSaldo },
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
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                        El precio del contrato aun no ha sido definido.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rentabilidad" className="mt-4">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Rentabilidad del evento</h3>
                    {resumenFinanciero ? (
                      <>
                        {(() => {
                          const margen = resumenFinanciero.ingresoContrato > 0
                            ? (resumenFinanciero.utilidadBruta / resumenFinanciero.ingresoContrato) * 100
                            : 0
                          const positivo = resumenFinanciero.utilidadBruta >= 0
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: 'Ingreso contrato', value: resumenFinanciero.ingresoContrato, color: 'text-gray-900 dark:text-gray-100' },
                                  { label: 'Adelanto recibido', value: resumenFinanciero.montoAdelanto, color: 'text-blue-700 dark:text-blue-400' },
                                  { label: 'Gastos adicionales', value: resumenFinanciero.totalGastosAdicionales, color: 'text-orange-600 dark:text-orange-400' },
                                  { label: 'Utilidad bruta', value: resumenFinanciero.utilidadBruta, color: positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
                                ].map(({ label, value, color }) => (
                                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-0.5">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className={`text-base font-black ${color}`}>{formatCurrency(value)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>Margen bruto</span>
                                  <span className={`font-black ${positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {margen.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                  <div
                                    className={`h-2 rounded-full transition-all ${positivo ? 'bg-emerald-500' : 'bg-red-400'}`}
                                    style={{ width: `${Math.min(Math.abs(margen), 100)}%` }}
                                  />
                                </div>
                              </div>
                              <Separator />
                              <GastosEventoPanel idEvento={idEvento} resumen={resumenFinanciero} />
                            </>
                          )
                        })()}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                        El precio del contrato aun no ha sido definido.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contrato" className="mt-4">
                  <ContratoEventoTab idEvento={idEvento} evento={evento} />
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Checklist operativo</h3>
                      <span className={cn('text-xs font-bold px-2 py-1 rounded-full',
                        pctChecklist === 100
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400')}>
                        {completadas}/{checklist.length} completadas
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
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
                              'group flex items-center gap-3 p-3 rounded-xl border transition-all',
                              item.completada
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
                                : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-brand-azul/30'
                            )}
                          >
                            <button
                              type="button"
                              className="shrink-0"
                              onClick={() => {
                                if (completar.isPending || descompletar.isPending) return
                                if (item.completada) {
                                  descompletar.mutate({ idEvento, idChecklist: item.id })
                                } else {
                                  completar.mutate({ idEvento, idChecklist: item.id })
                                }
                              }}
                            >
                              {item.completada
                                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                : <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600 hover:text-brand-azul transition-colors" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-semibold',
                                item.completada ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100')}>
                                {item.tarea}
                              </p>
                              {item.completada && item.usuarioCompleto && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.usuarioCompleto}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarTarea.mutate({ idEvento, idChecklist: item.id })}
                              disabled={eliminarTarea.isPending}
                              className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            value={nuevaTarea}
                            onChange={(e) => setNuevaTarea(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && nuevaTarea.trim()) {
                                e.preventDefault()
                                agregarTarea.mutate(
                                  { idEvento, tarea: nuevaTarea.trim() },
                                  { onSuccess: () => setNuevaTarea('') }
                                )
                              }
                            }}
                            placeholder="Nueva tarea..."
                            className="h-9 rounded-xl text-sm flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl gap-1.5 text-xs shrink-0"
                            disabled={!nuevaTarea.trim() || agregarTarea.isPending}
                            onClick={() => {
                              if (!nuevaTarea.trim()) return
                              agregarTarea.mutate(
                                { idEvento, tarea: nuevaTarea.trim() },
                                { onSuccess: () => setNuevaTarea('') }
                              )
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Cliente</h3>
                <InfoRow icon={User} label="Nombre" value={evento.nombreCliente} />
                <InfoRow icon={User} label="Correo" value={evento.correoCliente} />
                <InfoRow icon={User} label="Telefono" value={evento.telefonoCliente} />
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 justify-start text-xs" asChild>
                  <Link href={`${ADMIN_ROUTES.clientes}?search=${encodeURIComponent(evento.nombreCliente)}`}>
                    <ExternalLink className="h-3.5 w-3.5" /> Ver cliente
                  </Link>
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Información</h3>
                <InfoRow icon={CalendarDays} label="Solicitado el" value={evento.fechaCreacion ? formatDate(evento.fechaCreacion) : null} />
                {evento.usuarioGestor && (
                  <InfoRow icon={User} label="Gestionado por" value={evento.usuarioGestor} />
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Acciones rapidas</h3>
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 justify-start text-xs" asChild>
                  <Link href={`${ADMIN_ROUTES.reservas}?fecha=${evento.fechaEvento}`}>
                    <CalendarDays className="h-4 w-4" /> Ver reservas del dia
                  </Link>
                </Button>
                {evento.telefonoCliente && (
                  <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5 justify-start text-xs text-green-700 border-green-200 hover:bg-green-50" asChild>
                    <a
                      href={`https://wa.me/51${evento.telefonoCliente.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${evento.nombreCliente}, le contactamos sobre su evento del ${evento.fechaEvento}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp al cliente
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl gap-1.5 justify-start text-xs"
                  onClick={() => setTab('contrato')}
                >
                  <FileText className="h-4 w-4" /> Ver contrato
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl gap-1.5 justify-start text-xs"
                  onClick={() => setTab('rentabilidad')}
                >
                  <TrendingUp className="h-4 w-4" /> Ver rentabilidad
                </Button>
                {(evento.estado === 'SOLICITADA' || evento.estado === 'CONFIRMADA') && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl gap-1.5 justify-start text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => setDialogReprogramar(true)}
                    >
                      <CalendarClock className="h-4 w-4" /> Reprogramar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl gap-1.5 justify-start text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setDialogCancelar(true)}
                    >
                      <XCircle className="h-4 w-4" /> Cancelar evento
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <ConfirmarEventoModal
            evento={evento}
            open={modalConfirmar}
            onClose={() => setModalConfirmar(false)}
          />
        </>
      )}

      <Dialog
        open={!!cuotaSeleccionada}
        onOpenChange={(o) => !o && setCuotaSeleccionada(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Registrar pago · Cuota {cuotaSeleccionada?.numeroCuota}
            </DialogTitle>
          </DialogHeader>
          {cuotaSeleccionada && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Monto de la cuota</span>
                <span className="font-bold">{formatCurrency(cuotaSeleccionada.monto)}</span>
              </div>
              <MultiMedioPago
                value={pagosCuota}
                onChange={setPagosCuota}
                totalEsperado={cuotaSeleccionada.monto}
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setCuotaSeleccionada(null)}
              disabled={registrarCuota.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
              disabled={
                registrarCuota.isPending ||
                pagosCuota.some((p) => !p.medioPago || !p.monto) ||
                Math.abs(pagosCuota.reduce((s, p) => s + p.monto, 0) - (cuotaSeleccionada?.monto ?? 0)) >= 0.01
              }
              onClick={() => {
                if (!cuotaSeleccionada) return
                registrarCuota.mutate(
                  {
                    idEvento,
                    idCuota: cuotaSeleccionada.id,
                    payload: { pagos: pagosCuota },
                  },
                  { onSuccess: () => setCuotaSeleccionada(null) }
                )
              }}
            >
              {registrarCuota.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CreditCard className="h-4 w-4" />}
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogReprogramar} onOpenChange={(o) => !o && setDialogReprogramar(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reprogramar evento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            La reprogramacion de eventos estara disponible proxima version.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogReprogramar(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogCompletar} onOpenChange={(o) => !o && setDialogCompletar(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Marcar evento como completado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El evento pasara a estado COMPLETADA. Esta accion no puede revertirse.
            </p>
            {(evento?.montoSaldo ?? 0) > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  El cliente tiene un saldo pendiente de{' '}
                  <span className="font-bold">{formatCurrency(evento?.montoSaldo ?? 0)}</span>.
                </p>
              </div>
            )}
            {checklist.length > 0 && pctChecklist < 100 && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  El checklist operativo tiene{' '}
                  <span className="font-bold">{checklist.length - completadas} tarea(s) sin completar</span>{' '}
                  ({completadas}/{checklist.length}).
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogCompletar(false)}
              disabled={completarEvento.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
              disabled={completarEvento.isPending}
              onClick={() => completarEvento.mutate(idEvento, { onSuccess: () => setDialogCompletar(false) })}
            >
              {completarEvento.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {((evento?.montoSaldo ?? 0) > 0 || (checklist.length > 0 && pctChecklist < 100))
                ? 'Completar de todas formas'
                : 'Marcar completado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogCancelar} onOpenChange={(o) => !o && setDialogCancelar(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Cancelar evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esta acción no puede revertirse. Ingresa el motivo de cancelación.
            </p>
            <Textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Motivo de cancelación..."
              rows={3}
              className="resize-none"
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
                  { id: idEvento, motivo: motivoCancelacion },
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
