import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { Receipt, Calendar, User, Info, Loader2, Download, Ticket, Printer, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useVentaDetail } from '../../hooks/useVentaDetail'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TipoVentaBadge } from '../shared/TipoVentaBadge'
import { EstadoVentaBadge } from '../shared/EstadoVentaBadge'
import { Button } from '@/components/ui/Button'
import { ventasApi } from '../../services/ventas.api'
import { toast } from 'sonner'
import api from '@/services/api'

interface VentaDetailDrawerProps {
  ventaId: number | null
  onClose: () => void
}

export const VentaDetailDrawer = ({ ventaId, onClose }: VentaDetailDrawerProps) => {
  const router = useRouter()
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
    } catch (err) {
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
      const response = await api.get(`/reservas/${idReserva}/ticket`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.src = url
      document.body.appendChild(iframe)
      
      iframe.onload = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        }
      }
    } catch {
      toast.error('Error al generar la impresión del ticket')
    } finally {
      setLoadingPrintId(null)
    }
  }

  return (
    <Dialog open={!!ventaId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby="venta-detail-description" className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-gray-50 border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogDescription id="venta-detail-description">
            Información financiera y operativa detallada de la transacción.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-azul" />
            <p className="text-sm font-medium text-gray-500">Cargando detalles financieros...</p>
          </div>
        ) : isError || !venta ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <p className="text-sm font-bold text-red-500">Ocurrió un error al cargar la venta</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 bg-white border-b sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-start justify-between flex-1 mr-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xl font-black text-gray-900">
                    <Receipt className="h-5 w-5 text-gray-400" />
                    Venta V-{venta.id.toString().padStart(5, '0')}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {formatDate(venta.createdAt, "d MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <EstadoVentaBadge total={venta.total} pagado={venta.totalPagado !== undefined ? venta.totalPagado : venta.total} />
                  <TipoVentaBadge tipo={venta.tipo} />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold h-9"
                onClick={handleDescargar}
                disabled={descargando}
              >
                {descargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Nota Venta
              </Button>
            </div>

            <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[70vh]">
              
              <section className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Resumen Comercial
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Cliente
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {venta.nombreCliente || 'Cliente mostrador'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Fecha Operativa
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {venta.fechaVisita ? formatDate(venta.fechaVisita, "d MMM yyyy") : 'Inmediata'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" /> Canal
                    </p>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {venta.canalCodigo?.toLowerCase().replace('_', ' ') || 'Caja'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Desglose Financiero
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(venta.subtotal)}</span>
                  </div>
                  {venta.descuento > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Descuento</span>
                      <span className="font-bold text-green-600">− {formatCurrency(venta.descuento)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900 uppercase">Total Pagado</span>
                    <span className="text-xl font-black text-brand-azul">{formatCurrency(venta.total)}</span>
                  </div>
                </div>
              </section>

              {venta.pagos && venta.pagos.length > 0 && (
                <section className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Métodos de Pago
                  </h3>
                  <div className="space-y-2">
                    {venta.pagos.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-gray-700 uppercase">{p.medioPago}</span>
                          {p.referencia && (
                            <p className="text-[10px] text-gray-400 font-mono">Ref: {p.referencia}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{formatCurrency(p.monto)}</span>
                          <p className={`text-[9px] font-bold ${p.esValidado ? 'text-green-600' : 'text-amber-600'}`}>
                            {p.esValidado ? 'Validado' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {venta.tickets && venta.tickets.length > 0 && (
                <section className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Tickets Generados ({venta.tickets.length})
                  </h3>
                  <div className="space-y-3">
                    {venta.tickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {t.nombreNino} <span className="text-xs text-gray-400 font-normal">({t.edadNino} años)</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-primary">{t.numeroTicket}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              t.ingresado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {t.ingresado ? 'Ingresado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                         <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              router.push(`/admin/reservas?search=${t.numeroTicket}&drawerId=${t.id}`);
                            }}
                            title="Ver en Reservas"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDescargarTicket(t.id)}
                            disabled={loadingTicketId === t.id || loadingPrintId === t.id}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                          >
                            {loadingTicketId === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleImprimirTicket(t.id)}
                            disabled={loadingTicketId === t.id || loadingPrintId === t.id}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                          >
                            {loadingPrintId === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Printer className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {venta.notas && (
                <section className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 shadow-sm space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-amber-800 tracking-widest">
                    Notas Internas
                  </h3>
                  <p className="text-sm text-amber-900">{venta.notas}</p>
                </section>
              )}

            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
