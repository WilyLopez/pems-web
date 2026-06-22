import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { User, Calendar, Ticket, Coins, CreditCard, Tag, CheckCircle2, Receipt } from 'lucide-react'
import { Cliente } from '@/types/cliente.types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { NinoVenta, PagoLinea } from '../../types'

interface ResumenVentaProps {
  cliente: Cliente | null
  fechaVisita: string
  esHoy: boolean
  numNinos: number
  precioUnit: number
  subtotal: number
  descuento: number
  total: number
  sumaPagos: number
  vuelto: number
  ninos: NinoVenta[]
  pagos: PagoLinea[]
  promocionNombre?: string
  efectivoRecibido?: number
  efectivoAplicado?: number
}

export const ResumenVenta = ({
  cliente,
  fechaVisita,
  esHoy,
  numNinos,
  precioUnit,
  subtotal,
  descuento,
  total,
  sumaPagos,
  vuelto,
  ninos,
  pagos,
  promocionNombre,
  efectivoRecibido,
  efectivoAplicado = 0,
}: ResumenVentaProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none lg:sticky lg:top-20 transition-all duration-300">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col items-center justify-center pb-2 text-center">
          <div className="bg-primary/10 text-primary p-2 rounded-full mb-1">
            <Receipt className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Resumen de Venta</p>
          <p className="text-[9px] text-gray-400 font-medium font-sans">Borrador de Ticket</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-2.5 shadow-sm">
          {cliente ? (
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate">{cliente.nombreCompleto}</p>
                <p className="text-[10px] text-gray-500 truncate">Doc: {cliente.numeroDocumento}</p>
                {cliente.esVip && (
                  <span className="inline-block mt-0.5 text-[8px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                    Cliente VIP
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-gray-500">
              <div className="h-7 w-7 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Cliente Invitado</p>
                <p className="text-[9px] text-gray-400 font-sans">Venta rápida en mostrador</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-gray-600 border-t border-gray-50 pt-2.5">
            <div className="h-7 w-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-700 truncate">{formatDate(fechaVisita, "EEEE d 'de' MMMM")}</p>
              <span
                className={cn(
                  'inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mt-0.5',
                  esHoy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}
              >
                {esHoy ? 'Ingreso Hoy' : 'Reserva Anticipada'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Entradas ({numNinos})</span>
            <span className="text-[10px] font-bold text-primary">{formatCurrency(precioUnit)} c/u</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {ninos && ninos.length > 0 ? (
              ninos.map((nino, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-between shadow-sm transition-all hover:border-primary/20"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Ticket className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-bold text-gray-700 truncate">
                      {nino.nombreNino || `Niño ${index + 1}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                    {nino.edadNino} {nino.edadNino === 1 ? 'año' : 'años'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Ticket className="h-5 w-5 text-gray-300 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 font-bold">Sin niños registrados</p>
              </div>
            )}
          </div>
        </div>

        {promocionNombre && (
          <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
            <Tag className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-black tracking-wider text-indigo-400">Promoción Aplicada</p>
              <p className="text-xs font-bold truncate leading-tight">{promocionNombre}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Desglose de Cobro</span>
          <div className="space-y-1.5">
            {pagos && pagos.length > 0 ? (
              pagos.map((pago, index) => {
                const isEfectivo = pago.medioPago === 'EFECTIVO'
                return (
                  <div
                    key={index}
                    className={cn(
                      'bg-white border rounded-xl p-2 flex items-center justify-between shadow-sm border-gray-100',
                      pago.monto > 0 ? 'border-gray-200' : 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isEfectivo ? (
                        <Coins className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-gray-700">{pago.medioPago}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pago.referencia && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                          Ref: {pago.referencia}
                        </span>
                      )}
                      <span className="text-xs font-black text-gray-800">{formatCurrency(pago.monto)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-3 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <CreditCard className="h-5 w-5 text-gray-300 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 font-bold">Sin medios de pago agregados</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="font-bold text-gray-700">{formatCurrency(subtotal)}</span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Descuento</span>
              <span className="font-bold text-rose-600">- {formatCurrency(descuento)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
            <span className="text-sm font-black text-primary uppercase">Total Neto</span>
            <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] font-black uppercase text-gray-400">Estado de pago</span>
              {sumaPagos >= total ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Pago Completo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                  Pago Incompleto
                </span>
              )}
            </div>
          )}
        </div>

        {efectivoRecibido !== undefined && efectivoRecibido > 0 && pagos.some((p) => p.medioPago === 'EFECTIVO') && (
          <div className="space-y-1.5 pt-2 border-t border-dashed border-gray-200">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Efectivo Recibido</span>
              <span className="font-bold text-gray-700">{formatCurrency(efectivoRecibido)}</span>
            </div>
            {vuelto > 0 ? (
              <div className="flex justify-between items-center p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-700">
                <span className="text-[10px] font-black uppercase">Vuelto a Entregar</span>
                <span className="text-base font-black">{formatCurrency(vuelto)}</span>
              </div>
            ) : efectivoRecibido < efectivoAplicado ? (
              <div className="flex justify-between items-center p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                <span className="text-[10px] font-black uppercase">Falta Recibir</span>
                <span className="text-sm font-black">{formatCurrency(efectivoAplicado - efectivoRecibido)}</span>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}