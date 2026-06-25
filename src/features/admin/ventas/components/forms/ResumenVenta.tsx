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
    <Card className="border-brand-azul/20 dark:border-brand-azul/30 bg-brand-azul/5 dark:bg-brand-azul/10 shadow-none lg:sticky lg:top-20 transition-all duration-300">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col items-center justify-center pb-2 text-center">
          <div className="bg-brand-azul/10 dark:bg-brand-azul/20 text-brand-azul p-2 rounded-full mb-1">
            <Receipt className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-black text-brand-azul uppercase tracking-widest">Resumen de Venta</p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Borrador de Ticket</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 space-y-2.5 shadow-sm">
          {cliente ? (
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 bg-brand-azul/10 text-brand-azul rounded-lg flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{cliente.nombreCompleto}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Doc: {cliente.numeroDocumento}</p>
                {cliente.esVip && (
                  <span className="inline-block mt-0.5 text-[8px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full uppercase">
                    Cliente VIP
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Cliente Invitado</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">Venta rápida en mostrador</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-2.5">
            <div className="h-7 w-7 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{formatDate(fechaVisita, "EEEE d 'de' MMMM")}</p>
              <span
                className={cn(
                  'inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mt-0.5',
                  esHoy
                    ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                )}
              >
                {esHoy ? 'Ingreso Hoy' : 'Reserva Anticipada'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Entradas ({numNinos})</span>
            <span className="text-[10px] font-bold text-brand-azul">{formatCurrency(precioUnit)} c/u</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {ninos && ninos.length > 0 ? (
              ninos.map((nino, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-2 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Ticket className="h-3.5 w-3.5 text-brand-azul shrink-0" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                      {nino.nombreNino || `Niño ${index + 1}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                    {nino.edadNino} {nino.edadNino === 1 ? 'año' : 'años'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                <Ticket className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">Sin niños registrados</p>
              </div>
            )}
          </div>
        </div>

        {promocionNombre && (
          <div className="flex items-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl text-indigo-700 dark:text-indigo-300">
            <Tag className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-black tracking-wider text-indigo-400 dark:text-indigo-500">Promoción Aplicada</p>
              <p className="text-xs font-bold truncate leading-tight">{promocionNombre}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Desglose de Cobro</span>
          <div className="space-y-1.5">
            {pagos && pagos.length > 0 ? (
              pagos.map((pago, index) => {
                const isEfectivo = pago.medioPago === 'EFECTIVO'
                return (
                  <div
                    key={index}
                    className={cn(
                      'bg-white dark:bg-gray-900 border rounded-xl p-2 flex items-center justify-between shadow-sm',
                      pago.monto > 0
                        ? 'border-gray-200 dark:border-gray-700'
                        : 'border-gray-100 dark:border-gray-800 opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isEfectivo ? (
                        <Coins className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{pago.medioPago}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pago.referencia && (
                        <span className="text-[9px] bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">
                          Ref: {pago.referencia}
                        </span>
                      )}
                      <span className="text-xs font-black text-gray-800 dark:text-gray-100">{formatCurrency(pago.monto)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                <CreditCard className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">Sin medios de pago agregados</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
            <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(subtotal)}</span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Descuento</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatCurrency(descuento)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-sm font-black text-brand-azul uppercase">Total Neto</span>
            <span className="text-2xl font-black text-brand-azul">{formatCurrency(total)}</span>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500">Estado de pago</span>
              {sumaPagos >= total ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Pago Completo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 uppercase">
                  Pago Incompleto
                </span>
              )}
            </div>
          )}
        </div>

        {efectivoRecibido !== undefined && efectivoRecibido > 0 && pagos.some((p) => p.medioPago === 'EFECTIVO') && (
          <div className="space-y-1.5 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Efectivo Recibido</span>
              <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(efectivoRecibido)}</span>
            </div>
            {vuelto > 0 ? (
              <div className="flex justify-between items-center p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                <span className="text-[10px] font-black uppercase">Vuelto a Entregar</span>
                <span className="text-base font-black">{formatCurrency(vuelto)}</span>
              </div>
            ) : efectivoRecibido < efectivoAplicado ? (
              <div className="flex justify-between items-center p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
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
