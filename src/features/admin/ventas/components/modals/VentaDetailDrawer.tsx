import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Loader2, Download, Printer } from 'lucide-react'
import { useVentaDetail } from '../../hooks/useVentaDetail'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ventasApi } from '../../services/ventas.api'
import { toast } from 'sonner'
import { imprimirTicket } from '../../utils/printPdf'

interface VentaDetailDrawerProps {
  ventaId: number | null
  onClose: () => void
}

const TIPO_LABEL: Record<string, string> = {
  RESERVA: 'Venta de entradas',
  ADELANTO_EVENTO: 'Adelanto evento privado',
}

const CANAL_LABEL: Record<string, string> = {
  MOSTRADOR: 'Caja presencial',
  WEB: 'Tienda web',
  APP: 'Aplicación',
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
}

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <div className={`border-t ${dashed ? 'border-dashed border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`} />
  )
}

function Row({ label, value, bold, mono }: { label: string; value: React.ReactNode; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-0.5">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs text-right text-gray-900 dark:text-gray-100 ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export const VentaDetailDrawer = ({ ventaId, onClose }: VentaDetailDrawerProps) => {
  const { data: venta, isLoading, isError } = useVentaDetail(ventaId)
  const [descargando, setDescargando] = React.useState(false)
  const [loadingTicketId, setLoadingTicketId] = React.useState<number | null>(null)
  const [loadingPrintId, setLoadingPrintId] = React.useState<number | null>(null)

  const handleDescargar = async () => {
    if (!ventaId) return
    setDescargando(true)
    try {
      await ventasApi.descargarNotaVenta(ventaId)
      toast.success('Nota de venta descargada')
    } catch {
      toast.error('No se pudo descargar la nota de venta')
    } finally {
      setDescargando(false)
    }
  }

  const handleDescargarTicket = async (idReserva: number) => {
    setLoadingTicketId(idReserva)
    try {
      await ventasApi.descargarTicket(idReserva)
      toast.success('Ticket descargado')
    } catch {
      toast.error('Error al descargar ticket')
    } finally {
      setLoadingTicketId(null)
    }
  }

  const handleImprimirTicket = async (idReserva: number) => {
    setLoadingPrintId(idReserva)
    try {
      await imprimirTicket(idReserva)
    } catch {
      toast.error('Error al generar la impresión')
    } finally {
      setLoadingPrintId(null)
    }
  }

  return (
    <Dialog open={!!ventaId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby="venta-nota-desc"
        className="sm:max-w-sm p-0 gap-0 overflow-hidden bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Nota de Venta</DialogTitle>
          <DialogDescription id="venta-nota-desc">Comprobante de venta</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : isError || !venta ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">No se pudo cargar la venta</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[88vh]">

            {/* Cabecera */}
            <div className="px-6 pt-6 pb-4 text-center space-y-1 border-b border-gray-200 dark:border-gray-800">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Nota de Venta
              </p>
              <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100 font-mono">
                V-{venta.id.toString().padStart(5, '0')}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {formatDate(venta.createdAt, "d 'de' MMMM yyyy, HH:mm")}
              </p>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  (venta.totalPagado ?? 0) >= venta.total
                    ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500'
                }`}>
                  {(venta.totalPagado ?? 0) >= venta.total ? 'PAGADA' : 'PENDIENTE'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                  {TIPO_LABEL[venta.tipo] ?? venta.tipo}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4 text-sm">

              {/* Datos operativos */}
              <div className="space-y-1.5">
                <Row label="Canal" value={CANAL_LABEL[venta.canalCodigo] ?? venta.canalCodigo} />
                {venta.nombreCliente && (
                  <Row label="Cliente" value={venta.nombreCliente} bold />
                )}
                {venta.nombreAcompanante && (
                  <Row label="Acompañante" value={venta.nombreAcompanante} />
                )}
                {venta.dniAcompanante && (
                  <Row label="DNI" value={venta.dniAcompanante} mono />
                )}
                {venta.fechaVisita && (
                  <Row label="Fecha visita" value={formatDate(venta.fechaVisita, "d 'de' MMMM yyyy")} bold />
                )}
              </div>

              <Divider dashed />

              {/* Tickets */}
              {venta.tickets?.length > 0 && (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Entradas ({venta.tickets.length})
                    </p>
                    {venta.tickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2 py-1">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {t.nombreNino}
                            <span className="text-gray-400 dark:text-gray-500 font-normal"> · {t.edadNino} años</span>
                          </p>
                          <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                            {t.numeroTicket}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            t.ingresado
                              ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                          }`}>
                            {t.ingresado ? 'Ingresado' : 'Pendiente'}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDescargarTicket(t.id)}
                            disabled={loadingTicketId === t.id || loadingPrintId === t.id}
                            className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Descargar"
                          >
                            {loadingTicketId === t.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleImprimirTicket(t.id)}
                            disabled={loadingTicketId === t.id || loadingPrintId === t.id}
                            className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Imprimir"
                          >
                            {loadingPrintId === t.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Printer className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Divider dashed />
                </>
              )}

              {/* Desglose financiero */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Desglose
                </p>
                <Row label="Subtotal" value={formatCurrency(venta.subtotal)} mono />
                {venta.descuento > 0 && (
                  <Row label="Descuento" value={`− ${formatCurrency(venta.descuento)}`} mono />
                )}
              </div>

              <Divider />

              <div className="flex justify-between items-baseline py-1">
                <span className="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-black font-mono text-gray-900 dark:text-gray-100">
                  {formatCurrency(venta.total)}
                </span>
              </div>

              <Divider />

              {/* Métodos de pago */}
              {venta.pagos?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                    Pagos recibidos
                  </p>
                  {venta.pagos.map((p) => (
                    <div key={p.id} className="space-y-0.5">
                      <Row
                        label={METODO_LABEL[p.medioPago] ?? p.medioPago}
                        value={formatCurrency(p.monto)}
                        mono
                      />
                      {p.referencia && (
                        <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 text-right">
                          Ref: {p.referencia}
                        </p>
                      )}
                      {!p.esValidado && (
                        <p className="text-[10px] text-right text-gray-400 dark:text-gray-500 italic">
                          Sin validar
                        </p>
                      )}
                    </div>
                  ))}
                  {venta.vuelto != null && venta.vuelto > 0 && (
                    <Row label="Vuelto" value={formatCurrency(venta.vuelto)} mono bold />
                  )}
                </div>
              )}

              {/* Notas */}
              {venta.notas && (
                <>
                  <Divider dashed />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Notas
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{venta.notas}</p>
                  </div>
                </>
              )}

              {/* Pie de página */}
              <Divider dashed />
              <div className="pb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] text-gray-300 dark:text-gray-600 font-mono">
                  {formatDate(venta.createdAt, 'yyyy-MM-dd HH:mm')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDescargar}
                  disabled={descargando}
                  className="h-7 text-xs gap-1.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {descargando
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Download className="h-3 w-3" />}
                  Descargar nota
                </Button>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
