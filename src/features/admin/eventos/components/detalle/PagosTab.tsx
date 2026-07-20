'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { useRegistrarSaldo } from '../../hooks/useEventos'
import { EventoCuota, EventoPrivado } from '../../types'
import { PagarCuotaDialog } from '../dialogs/PagarCuotaDialog'
import { MediosPagoSelect } from '@/features/admin/config/components/MediosPagoSelect'
import { useMiSesionCaja, CajaRequeridaAlert } from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

interface PagosTabProps {
  evento: EventoPrivado
  idEvento: number
}

export function PagosTab({ evento, idEvento }: PagosTabProps) {
  const registrarSaldo = useRegistrarSaldo()
  const { data: miSesionCaja, isLoading: cargandoSesionCaja } =
    useMiSesionCaja()
  const [montoSaldo, setMontoSaldo] = useState('')
  const [medioPagoSaldo, setMedioPagoSaldo] = useState('')
  const [cuotaSeleccionada, setCuotaSeleccionada] =
    useState<EventoCuota | null>(null)

  const sinCajaAdministrativa =
    !cargandoSesionCaja && miSesionCaja?.tipo !== 'ADMINISTRATIVA'
  const efectivoSaldoBloqueado =
    medioPagoSaldo === 'EFECTIVO' && sinCajaAdministrativa
  const montoSaldoExcedeSaldo =
    !!montoSaldo && parseFloat(montoSaldo) > (evento.montoSaldo ?? 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        Estado financiero
      </h3>
      {evento.precioTotalContrato ? (
        <>
          <div className="space-y-3">
            {[
              {
                label: 'Total contratado',
                value: evento.precioTotalContrato,
                cls: 'text-gray-900 dark:text-gray-100',
              },
              {
                label: 'Adelanto recibido',
                value: evento.montoAdelanto ?? 0,
                cls: 'text-green-700 dark:text-green-400',
              },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <span className={cn('text-sm font-black', cls)}>
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Saldo pendiente
              </span>
              <span
                className={cn(
                  'text-lg font-black',
                  (evento.montoSaldo ?? 0) > 0
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-green-700 dark:text-green-400'
                )}
              >
                {formatCurrency(evento.montoSaldo ?? 0)}
              </span>
            </div>
          </div>

          {evento.modalidadPago === 'CUOTAS' &&
          evento.cuotas &&
          evento.cuotas.length > 0 ? (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Plan de cuotas
                </h4>
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
                      cuota.estado === 'PAGADO' &&
                        'bg-green-50/50 dark:bg-green-950/20'
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
                    {cuota.estado !== 'PAGADO' &&
                      evento.estado === 'CONFIRMADA' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs rounded-lg shrink-0 border-brand-azul text-brand-azul hover:bg-brand-azul/5"
                          onClick={() => setCuotaSeleccionada(cuota)}
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
                  Medio de pago adelanto:{' '}
                  <span className="font-semibold">{evento.medioPago}</span>
                </p>
              )}
              {evento.estado === 'CONFIRMADA' &&
                (evento.montoSaldo ?? 0) > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Registrar pago del saldo
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        max={evento.montoSaldo}
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
                        disabled={
                          !montoSaldo ||
                          !medioPagoSaldo ||
                          efectivoSaldoBloqueado ||
                          montoSaldoExcedeSaldo ||
                          registrarSaldo.isPending
                        }
                        onClick={() => {
                          if (
                            !montoSaldo ||
                            !medioPagoSaldo ||
                            efectivoSaldoBloqueado ||
                            montoSaldoExcedeSaldo
                          )
                            return
                          registrarSaldo.mutate(
                            {
                              id: idEvento,
                              monto: parseFloat(montoSaldo),
                              medioPago: medioPagoSaldo,
                            },
                            {
                              onSuccess: () => {
                                setMontoSaldo('')
                                setMedioPagoSaldo('')
                              },
                            }
                          )
                        }}
                      >
                        {registrarSaldo.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5" />
                        )}
                        Registrar
                      </Button>
                    </div>
                    {montoSaldoExcedeSaldo && (
                      <p className="text-xs text-destructive">
                        El monto no puede superar el saldo pendiente (
                        {formatCurrency(evento.montoSaldo ?? 0)}).
                      </p>
                    )}
                    {efectivoSaldoBloqueado && (
                      <CajaRequeridaAlert mensaje="Para cobrar en efectivo necesitas tu Caja Administrativa abierta." />
                    )}
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

      <PagarCuotaDialog
        cuota={cuotaSeleccionada}
        idEvento={idEvento}
        sinCajaAdministrativa={sinCajaAdministrativa}
        onClose={() => setCuotaSeleccionada(null)}
      />
    </div>
  )
}
