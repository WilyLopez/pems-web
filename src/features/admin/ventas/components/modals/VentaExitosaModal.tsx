import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Card, CardContent } from '@/components/ui/Card'
import { CheckCircle2, Download, Printer, Loader2, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { VentaMostradorResponse } from '../../types'

interface VentaExitosaModalProps {
  open: boolean
  onClose: () => void
  venta: VentaMostradorResponse | null
  descargandoNota: boolean
  loadingTicketId: number | null
  loadingPrintId: number | null
  enviarCorreoPending: boolean
  correoDestinatario: string
  onCorreoDestinatarioChange: (val: string) => void
  onDescargarNota: () => void
  onDescargarTicket: (idReserva: number) => void
  onImprimirTicket: (idReserva: number) => void
  onEnviarCorreo: () => void
}

export const VentaExitosaModal = ({
  open,
  onClose,
  venta,
  descargandoNota,
  loadingTicketId,
  loadingPrintId,
  enviarCorreoPending,
  correoDestinatario,
  onCorreoDestinatarioChange,
  onDescargarNota,
  onDescargarTicket,
  onImprimirTicket,
  onEnviarCorreo,
}: VentaExitosaModalProps) => {
  if (!venta) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby="venta-exitosa-description" className="sm:max-w-md p-0 gap-0 overflow-hidden bg-gray-50 border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Venta Exitosa</DialogTitle>
          <DialogDescription id="venta-exitosa-description">
            Comprobantes y acciones para la venta generada de forma exitosa.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 text-center space-y-4 bg-white border-b">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-black text-green-800">¡Venta registrada con éxito!</p>
            <p className="text-sm text-green-700">Se han generado {venta.tickets.length} ticket{venta.tickets.length > 1 ? 's' : ''}</p>
          </div>
          {venta.vuelto > 0 && (
            <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl max-w-xs mx-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Vuelto a entregar</p>
              <p className="text-3xl font-black text-green-700">{formatCurrency(venta.vuelto)}</p>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <section className="bg-white rounded-2xl p-4 border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Comprobante Comercial</p>
                <p className="text-sm font-bold text-gray-900 mt-1">Nota de Venta V-{venta.ventaId.toString().padStart(5, '0')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onDescargarNota}
                disabled={descargandoNota}
                className="rounded-xl font-bold h-9"
              >
                {descargandoNota ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Descargar Nota
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider px-1">Tickets de Ingreso ({venta.tickets.length})</p>
            <div className="space-y-2">
              {venta.tickets.map((t) => (
                <Card key={t.reservaId} className="border-none shadow-sm overflow-hidden bg-white">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Ticket className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate text-gray-900">{t.nombreNino}</p>
                        <p className="text-[10px] font-mono font-bold text-primary">{t.numeroTicket}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDescargarTicket(t.reservaId)}
                        disabled={loadingTicketId === t.reservaId || loadingPrintId === t.reservaId}
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                      >
                        {loadingTicketId === t.reservaId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onImprimirTicket(t.reservaId)}
                        disabled={loadingTicketId === t.reservaId || loadingPrintId === t.reservaId}
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                      >
                        {loadingPrintId === t.reservaId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-bold text-gray-400 uppercase">Enviar comprobantes por correo</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correoDestinatario}
                  onChange={(e) => onCorreoDestinatarioChange(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={onEnviarCorreo}
                  disabled={enviarCorreoPending}
                  className="font-bold shrink-0 h-9"
                >
                  {enviarCorreoPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 bg-white border-t flex justify-end">
          <Button onClick={onClose} className="w-full rounded-xl font-bold h-11 uppercase text-xs tracking-wider">
            Nueva Venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
