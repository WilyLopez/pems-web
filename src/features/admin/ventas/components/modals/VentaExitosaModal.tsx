import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { CheckCircle2, Download, Printer, Loader2, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { VentaMostradorResponse } from '../../types'
import { ventasApi } from '../../services/ventas.api'
import {
  useEnviarCorreoVenta,
  useMarcarImpreso,
  useMarcarDescargado,
} from '../../hooks/useVentasData'
import { imprimirTicket } from '../../utils/printPdf'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface VentaExitosaModalProps {
  open: boolean
  venta: VentaMostradorResponse | null
  defaultCorreo: string
  onClose: () => void
}

export const VentaExitosaModal = ({
  open,
  venta,
  defaultCorreo,
  onClose,
}: VentaExitosaModalProps) => {
  const [correoDestinatario, setCorreoDestinatario] = useState(defaultCorreo)
  const [descargandoNota, setDescargandoNota] = useState(false)
  const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null)
  const [loadingPrintId, setLoadingPrintId] = useState<number | null>(null)
  const [imprimiendoTodos, setImprimiendoTodos] = useState(false)

  const enviarCorreo = useEnviarCorreoVenta()
  const marcarImpreso = useMarcarImpreso()
  const marcarDescargado = useMarcarDescargado()

  useEffect(() => {
    if (open) setCorreoDestinatario(defaultCorreo)
  }, [open, defaultCorreo])

  const handleDescargarNota = async () => {
    if (!venta) return
    setDescargandoNota(true)
    try {
      await ventasApi.descargarNotaVenta(venta.ventaId)
      marcarDescargado.mutate(venta.ventaId)
      toast.success('Nota de venta descargada')
    } catch {
      toast.error('Error al descargar nota de venta')
    } finally {
      setDescargandoNota(false)
    }
  }

  const handleDescargarTicket = async (idReserva: number) => {
    if (!venta) return
    setLoadingTicketId(idReserva)
    try {
      await ventasApi.descargarTicket(idReserva)
      marcarDescargado.mutate(venta.ventaId)
      toast.success('Ticket descargado')
    } catch {
      toast.error('Error al descargar ticket')
    } finally {
      setLoadingTicketId(null)
    }
  }

  const handleImprimirTicket = async (idReserva: number) => {
    if (!venta) return
    setLoadingPrintId(idReserva)
    try {
      await imprimirTicket(idReserva)
      marcarImpreso.mutate(venta.ventaId)
    } catch {
      toast.error('Error al generar la impresión del ticket')
    } finally {
      setLoadingPrintId(null)
    }
  }

  const handleImprimirTodos = async () => {
    if (!venta || venta.tickets.length === 0) return
    setImprimiendoTodos(true)
    try {
      for (const t of venta.tickets) {
        await imprimirTicket(t.reservaId)
        await new Promise((r) => setTimeout(r, 300))
      }
      marcarImpreso.mutate(venta.ventaId)
    } catch {
      toast.error('Error al imprimir los tickets')
    } finally {
      setImprimiendoTodos(false)
    }
  }

  const handleEnviarCorreo = async () => {
    if (!venta) return
    const correo = correoDestinatario.trim()
    if (!correo || !EMAIL_REGEX.test(correo)) {
      toast.error('Ingresa un correo electrónico válido')
      return
    }
    try {
      await enviarCorreo.mutateAsync({ idVenta: venta.ventaId, correo })
    } catch {}
  }

  if (!venta) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby="venta-exitosa-description"
        className="sm:max-w-md p-0 gap-0 overflow-hidden bg-gray-50 dark:bg-gray-950 border-none shadow-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Venta Exitosa</DialogTitle>
          <DialogDescription id="venta-exitosa-description">
            Comprobantes y acciones para la venta generada de forma exitosa.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 text-center space-y-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-lg font-black text-green-800 dark:text-green-400">
              ¡Venta registrada con éxito!
            </p>
            <p className="text-sm text-green-700 dark:text-green-500">
              Se han generado {venta.tickets.length} ticket
              {venta.tickets.length > 1 ? 's' : ''}
            </p>
          </div>
          {venta.vuelto > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-2xl max-w-xs mx-auto">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Vuelto a entregar
              </p>
              <p className="text-3xl font-black text-green-700 dark:text-green-400">
                {formatCurrency(venta.vuelto)}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  Comprobante Comercial
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                  Nota de Venta V-{venta.ventaId.toString().padStart(5, '0')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDescargarNota}
                disabled={descargandoNota}
                className="rounded-xl font-bold h-9 border-gray-200 dark:border-gray-700 dark:text-gray-300"
              >
                {descargandoNota ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Descargar Nota
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                Tickets de Ingreso ({venta.tickets.length})
              </p>
              {venta.tickets.length > 1 && (
                <button
                  type="button"
                  onClick={handleImprimirTodos}
                  disabled={imprimiendoTodos || loadingPrintId !== null}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand-azul hover:underline disabled:opacity-40"
                >
                  {imprimiendoTodos ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Printer className="h-3 w-3" />
                  )}
                  Imprimir todos
                </button>
              )}
            </div>
            <div className="space-y-2">
              {venta.tickets.map((t) => (
                <Card
                  key={t.reservaId}
                  className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-900"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                        <Ticket className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">
                          {t.nombreNino}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-brand-azul">
                          {t.numeroTicket}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDescargarTicket(t.reservaId)}
                        disabled={
                          loadingTicketId === t.reservaId ||
                          loadingPrintId === t.reservaId ||
                          imprimiendoTodos
                        }
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
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
                        onClick={() => handleImprimirTicket(t.reservaId)}
                        disabled={
                          loadingTicketId === t.reservaId ||
                          loadingPrintId === t.reservaId ||
                          imprimiendoTodos
                        }
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
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

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                Enviar comprobantes por correo
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correoDestinatario}
                  onChange={(e) => setCorreoDestinatario(e.target.value)}
                  className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEnviarCorreo}
                  disabled={enviarCorreo.isPending}
                  className="font-bold shrink-0 h-9 bg-brand-azul hover:bg-brand-azul/90"
                >
                  {enviarCorreo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <Button
            onClick={onClose}
            className="w-full rounded-xl font-bold h-11 uppercase text-xs tracking-wider bg-brand-azul hover:bg-brand-azul/90"
          >
            Nueva Venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
