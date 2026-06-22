'use client'

import React, { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { Receipt, Calendar, User, Info, Loader2, CheckCircle2, AlertCircle, Banknote } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Reserva } from '../../types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { useCobrarReserva } from '@/features/admin/ventas/hooks/useVentasData'
import { METODOS_PAGO } from '@/features/admin/ventas/schema/ventaMostrador.schema'
import { calcularResumenVenta, DENOMINACIONES_EFECTIVO } from '@/features/admin/ventas/utils/ventas.utils'
import { cn } from '@/lib/utils'

const cobrarSchema = z.object({
  pagos: z.array(z.object({
    medioPago: z.enum(METODOS_PAGO),
    monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
    referencia: z.string().trim().optional(),
  })).min(1, 'Agrega al menos un medio de pago'),
  efectivoRecibido: z.coerce.number().min(0).default(0),
  actaFirmada: z.boolean().refine(v => v === true, { message: 'Debe confirmar el acta' }),
  notas: z.string().optional(),
})

type CobrarFormValues = z.infer<typeof cobrarSchema>

interface CobrarReservaDrawerProps {
  reserva: Reserva | null
  onClose: () => void
}

export const CobrarReservaDrawer = ({ reserva, onClose }: CobrarReservaDrawerProps) => {
  const cobrarMutation = useCobrarReserva()

  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<CobrarFormValues>({
    resolver: zodResolver(cobrarSchema),
    mode: 'onChange',
    defaultValues: {
      pagos: [{ medioPago: 'EFECTIVO', monto: reserva?.totalPagado ?? 0 }],
      efectivoRecibido: reserva?.totalPagado ?? 0,
      actaFirmada: false,
      notas: '',
    }
  })

  const formValues = watch()
  
  const resumen = useMemo(() => {
    if (!reserva) return null
    return calcularResumenVenta(
      reserva.precioHistorico,
      [{ nombreNino: reserva.nombreNino, edadNino: reserva.edadNino }],
      undefined, // No manejamos cambio de promo aquí por simplicidad del flujo de cobro rápido
      formValues.pagos as any,
      formValues.efectivoRecibido
    )
  }, [reserva, formValues.pagos, formValues.efectivoRecibido])

  const onSubmit = async (data: CobrarFormValues) => {
    if (!reserva) return
    try {
      await cobrarMutation.mutateAsync({
        reservaId: reserva.id,
        payload: {
          pagos: data.pagos,
          efectivoRecibido: data.efectivoRecibido,
          actaFirmada: data.actaFirmada,
          notas: data.notas,
        }
      })
      onClose()
    } catch (err) {
      // Error handled by hook
    }
  }

  if (!reserva) return null

  return (
    <Dialog open={!!reserva} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-gray-50 border-none shadow-2xl">
        <DialogHeader className="px-6 py-5 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xl font-black text-gray-900">
            <Banknote className="h-5 w-5 text-brand-azul" />
            Cobrar Reserva
          </div>
          <DialogDescription className="text-xs font-medium text-gray-500">
            Ticket {reserva.numeroTicket} &bull; {reserva.nombreNino}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Info de la Reserva */}
            <section className="bg-white rounded-2xl p-4 border shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400">Niño / Edad</p>
                <p className="text-sm font-bold">{reserva.nombreNino} ({reserva.edadNino} años)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400">Fecha Visita</p>
                <p className="text-sm font-bold">{formatDate(reserva.fechaEvento)}</p>
              </div>
              <div className="col-span-2 pt-2 border-t mt-2 flex justify-between items-center">
                <p className="text-sm font-black text-gray-900 uppercase">Monto a Cobrar</p>
                <p className="text-xl font-black text-brand-azul">{formatCurrency(reserva.totalPagado)}</p>
              </div>
            </section>

            {/* Formulario de Pago */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Medios de Pago</h3>
              
              <div className="space-y-3">
                {formValues.pagos.map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-gray-400">Medio</Label>
                        <Controller
                          control={control}
                          name={`pagos.${index}.medioPago`}
                          render={({ field }) => (
                            <select 
                              {...field}
                              className="w-full h-9 rounded-lg border border-gray-200 text-sm font-medium px-2 focus:ring-2 focus:ring-brand-azul/20 outline-none"
                            >
                              {METODOS_PAGO.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-gray-400">Monto</Label>
                        <Controller
                          control={control}
                          name={`pagos.${index}.monto`}
                          render={({ field }) => (
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              className="h-9 font-bold"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formValues.pagos.some(p => p.medioPago === 'EFECTIVO') && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-700">Efectivo Recibido</Label>
                  <Controller
                    control={control}
                    name="efectivoRecibido"
                    render={({ field: f }) => (
                      <div className="space-y-3">
                        <Input 
                          type="number" 
                          {...f} 
                          className="h-10 text-lg font-black text-amber-900 border-amber-200" 
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {DENOMINACIONES_EFECTIVO.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => f.onChange(m)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors',
                                f.value === m ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-amber-100 border-amber-200'
                              )}
                            >
                              S/{m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                  {resumen && resumen.vuelto > 0 && (
                    <div className="pt-2 flex justify-between items-center border-t border-amber-200">
                      <span className="text-xs font-bold text-amber-700 uppercase">Vuelto a entregar</span>
                      <span className="text-lg font-black text-amber-900">{formatCurrency(resumen.vuelto)}</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white p-4 rounded-2xl border shadow-sm space-y-4">
               <div className="flex items-start gap-3">
                <Controller
                  control={control}
                  name="actaFirmada"
                  render={({ field }) => (
                    <Checkbox
                      id="acta-cobro"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="acta-cobro" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Acta de responsabilidad firmada
                  </label>
                  <p className="text-[10px] text-gray-400">
                    El cliente confirma la firma física o digital del acta.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="p-6 bg-white border-t space-y-3">
            {!resumen?.montosCoinciden && (
               <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[10px] font-bold">La suma de pagos debe ser {formatCurrency(reserva.totalPagado)}</p>
               </div>
            )}
            <Button
              type="submit"
              disabled={!isValid || !resumen?.montosCoinciden || cobrarMutation.isPending}
              className="w-full h-12 rounded-xl font-black uppercase tracking-wider"
            >
              {cobrarMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando...
                </>
              ) : (
                `Completar Cobro ${formatCurrency(reserva.totalPagado)}`
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={cobrarMutation.isPending}
              className="w-full text-xs font-bold text-gray-400"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
