'use client'

import { useState } from 'react'
import { Plus, Lock, Unlock, TrendingUp, TrendingDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import {
  useCaja,
  useCajaMutations,
  useMovimientosCaja,
  abrirCajaSchema,
  cerrarCajaSchema,
  movimientoCajaSchema,
} from '@/features/admin/finance'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type AbrirForm       = z.infer<typeof abrirCajaSchema>
type CerrarForm      = z.infer<typeof cerrarCajaSchema>
type MovimientoForm  = z.infer<typeof movimientoCajaSchema>

export default function CajaPage() {
  const { idSede } = useAuth()
  const hoy = new Date().toISOString().slice(0, 10)

  const [fecha, setFecha]          = useState(hoy)
  const [modalAbrir, setModalAbrir]    = useState(false)
  const [modalCerrar, setModalCerrar]  = useState(false)
  const [modalMov, setModalMov]        = useState(false)

  const { data: caja, isLoading }  = useCaja(idSede ?? undefined, fecha)
  const { data: movimientos = [] } = useMovimientosCaja(caja?.id)
  const { abrir, cerrar, registrarMovimiento } = useCajaMutations()

  const formAbrir = useForm<AbrirForm>({ resolver: zodResolver(abrirCajaSchema), defaultValues: { saldoInicial: 0 } })
  const formCerrar = useForm<CerrarForm>({ resolver: zodResolver(cerrarCajaSchema), defaultValues: { saldoFinal: 0 } })
  const formMov    = useForm<MovimientoForm>({ resolver: zodResolver(movimientoCajaSchema) })

  function onAbrir(v: AbrirForm) {
    if (!idSede) return
    abrir.mutate({ idSede, payload: { ...v, fecha } }, { onSuccess: () => { formAbrir.reset(); setModalAbrir(false) } })
  }
  function onCerrar(v: CerrarForm) {
    if (!caja) return
    cerrar.mutate({ idApertura: caja.id, payload: v }, { onSuccess: () => { formCerrar.reset(); setModalCerrar(false) } })
  }
  function onMovimiento(v: MovimientoForm) {
    if (!caja) return
    registrarMovimiento.mutate(
      { idApertura: caja.id, payload: v },
      { onSuccess: () => { formMov.reset(); setModalMov(false) } }
    )
  }

  const estaAbierta = caja?.estado === 'ABIERTA'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Caja" description="Control de apertura y movimientos de caja por día" />
        <div className="flex items-center gap-2">
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-9 w-40" />
          {!caja && !isLoading && (
            <Button size="sm" onClick={() => setModalAbrir(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Unlock className="h-4 w-4" />
              Abrir caja
            </Button>
          )}
          {estaAbierta && (
            <>
              <Button size="sm" variant="outline" onClick={() => setModalMov(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Movimiento
              </Button>
              <Button size="sm" onClick={() => setModalCerrar(true)} className="gap-1.5 bg-red-600 hover:bg-red-700 text-white">
                <Lock className="h-4 w-4" />
                Cerrar caja
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : !caja ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-2">
          <Lock className="mx-auto h-10 w-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No hay caja registrada para esta fecha.</p>
          {fecha === hoy && (
            <Button size="sm" onClick={() => setModalAbrir(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
              <Unlock className="h-4 w-4" />
              Abrir caja ahora
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Saldo inicial',  value: caja.saldoInicial,   icon: TrendingUp,   color: 'bg-gray-100 text-gray-600' },
              { label: 'Total ingresos', value: caja.totalIngresos,  icon: TrendingUp,   color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Total egresos',  value: caja.totalEgresos,   icon: TrendingDown, color: 'bg-red-100 text-red-600' },
              { label: 'Saldo final',    value: caja.saldoFinal ?? (caja.saldoInicial + caja.totalIngresos - caja.totalEgresos),
                icon: TrendingUp, color: 'bg-brand-azul/10 text-brand-azul' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{formatCurrency(value)}</p>
                  <p className="text-sm font-semibold text-gray-600">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              estaAbierta ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            )}>
              {estaAbierta ? 'ABIERTA' : 'CERRADA'}
            </span>
            {caja.observaciones && (
              <span className="text-xs text-gray-400">{caja.observaciones}</span>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700">Movimientos</h3>
            </div>
            {movimientos.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Sin movimientos registrados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Concepto</th>
                    <th className="px-4 py-3 font-semibold">Medio de pago</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                          m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        )}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{m.concepto}</td>
                      <td className="px-4 py-3 text-gray-500">{m.medioPago ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{m.esManual ? 'Manual' : 'Automático'}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold', m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-500')}>
                        {m.tipo === 'EGRESO' ? '-' : ''}{formatCurrency(m.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Dialog open={modalAbrir} onOpenChange={setModalAbrir}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Abrir caja</DialogTitle></DialogHeader>
          <form onSubmit={formAbrir.handleSubmit(onAbrir)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Saldo inicial (S/)</Label>
              <Input type="number" step="0.01" min="0" {...formAbrir.register('saldoInicial')} />
              {formAbrir.formState.errors.saldoInicial && (
                <p className="text-xs text-red-500">{formAbrir.formState.errors.saldoInicial.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <Input {...formAbrir.register('observaciones')} placeholder="Opcional…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalAbrir(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={abrir.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">Abrir</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalCerrar} onOpenChange={setModalCerrar}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Cerrar caja</DialogTitle></DialogHeader>
          <form onSubmit={formCerrar.handleSubmit(onCerrar)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Saldo final (S/)</Label>
              <Input type="number" step="0.01" min="0" {...formCerrar.register('saldoFinal')} />
              {formCerrar.formState.errors.saldoFinal && (
                <p className="text-xs text-red-500">{formCerrar.formState.errors.saldoFinal.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <Input {...formCerrar.register('observaciones')} placeholder="Opcional…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalCerrar(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={cerrar.isPending} className="bg-red-600 hover:bg-red-700 text-white">Cerrar caja</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMov} onOpenChange={setModalMov}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Registrar movimiento</DialogTitle></DialogHeader>
          <form onSubmit={formMov.handleSubmit(onMovimiento)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <select {...formMov.register('tipo')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                <option value="">Seleccionar…</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
              {formMov.formState.errors.tipo && <p className="text-xs text-red-500">{formMov.formState.errors.tipo.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Concepto</Label>
              <Input {...formMov.register('concepto')} placeholder="Descripción del movimiento" />
              {formMov.formState.errors.concepto && <p className="text-xs text-red-500">{formMov.formState.errors.concepto.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Monto (S/)</Label>
                <Input type="number" step="0.01" min="0" {...formMov.register('monto')} />
                {formMov.formState.errors.monto && <p className="text-xs text-red-500">{formMov.formState.errors.monto.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Medio de pago</Label>
                <select {...formMov.register('medioPago')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                  <option value="">—</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalMov(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={registrarMovimiento.isPending} className="bg-brand-azul hover:bg-brand-azul/90 text-white">Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
