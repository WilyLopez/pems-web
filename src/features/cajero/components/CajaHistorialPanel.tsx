'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  AperturaCaja,
  useCajasRango,
  useCajaMutations,
  cerrarCajaForzadoSchema,
} from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Calendar, Lock, AlertTriangle, ClipboardList } from 'lucide-react'

type FormValues = z.infer<typeof cerrarCajaForzadoSchema>

interface Props {
  idSede: number
}

function formatFechaLocal(fechaStr: string) {
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatHoraLocal(isoStr: string | null | undefined) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CajaHistorialPanel({ idSede }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const [inicio, setInicio] = useState(thirtyDaysAgo)
  const [fin, setFin] = useState(today)

  const { data: cajas = [], isLoading } = useCajasRango(idSede, inicio, fin)
  const { cerrarForzado } = useCajaMutations()

  const [selectedCaja, setSelectedCaja] = useState<AperturaCaja | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(cerrarCajaForzadoSchema),
    defaultValues: { saldoFinal: 0, motivo: '', observaciones: '' },
  })

  const saldoFinalWatch = useWatch({ control, name: 'saldoFinal' })
  const saldoFinalNum = Number(saldoFinalWatch) || 0

  const saldoEsperado = selectedCaja
    ? selectedCaja.saldoEsperado ??
      selectedCaja.saldoInicial + selectedCaja.totalIngresos - selectedCaja.totalEgresos
    : 0

  const diferencia = saldoFinalNum - saldoEsperado

  function handleOpenCloseDialog(caja: AperturaCaja) {
    setSelectedCaja(caja)
    reset({
      saldoFinal: Number(
        (caja.saldoInicial + caja.totalIngresos - caja.totalEgresos).toFixed(2)
      ),
      motivo: '',
      observaciones: '',
    })
  }

  function onSubmitClose(v: FormValues) {
    if (!selectedCaja) return
    cerrarForzado.mutate(
      { idSesion: selectedCaja.id, payload: v },
      {
        onSuccess: () => {
          setSelectedCaja(null)
          reset()
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-end gap-4 shadow-sm">
        <div className="space-y-1">
          <Label className="text-gray-500 font-semibold text-xs">Fecha Inicio</Label>
          <div className="relative">
            <Input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-9 w-44 pl-9"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-gray-500 font-semibold text-xs">Fecha Fin</Label>
          <div className="relative">
            <Input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="h-9 w-44 pl-9"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-brand-azul" />
            <h3 className="text-sm font-bold text-gray-700">Sesiones de caja</h3>
          </div>
          {isLoading && <span className="text-xs text-gray-400 animate-pulse">Cargando historial...</span>}
        </div>

        {cajas.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 space-y-2">
            <AlertTriangle className="mx-auto h-8 w-8 text-gray-300" />
            <p>No se encontraron sesiones de caja en este rango de fechas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase">
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Apertura / Cierre</TableHead>
                <TableHead className="text-right">Inicial</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Egresos</TableHead>
                <TableHead className="text-right">Final (Cierre)</TableHead>
                <TableHead className="text-right">Diferencia</TableHead>
                <TableHead className="text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cajas.map((c) => {
                const abierta = c.estado === 'ABIERTA'
                const diff = c.diferencia ?? 0
                return (
                  <TableRow key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <TableCell className="font-bold text-gray-800" suppressHydrationWarning>
                      {formatFechaLocal(c.fecha)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold border-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
                      >
                        {c.tipo === 'ADMINISTRATIVA' ? 'ADMIN' : 'CAJERO'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={abierta ? 'default' : 'secondary'}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold border-0',
                          abierta
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        {abierta ? 'ABIERTA' : 'CERRADA'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400" suppressHydrationWarning>
                      <div>Apertura: {formatHoraLocal(c.fechaApertura)}</div>
                      {!abierta && <div>Cierre: {formatHoraLocal(c.fechaCierre)}</div>}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-gray-700">
                      {formatCurrency(c.saldoInicial)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-emerald-600">
                      +{formatCurrency(c.totalIngresos)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-red-500">
                      -{formatCurrency(c.totalEgresos)}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-gray-800">
                      {abierta ? '—' : formatCurrency(c.saldoFinal ?? 0)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold tabular-nums',
                        abierta
                          ? 'text-gray-300'
                          : diff >= 0
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      )}
                    >
                      {abierta ? '—' : (diff >= 0 ? '+' : '') + formatCurrency(diff)}
                    </TableCell>
                    <TableCell className="text-center">
                      {abierta ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenCloseDialog(c)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1 rounded-lg px-2.5 py-1 text-[11px] h-7"
                        >
                          <Lock className="h-3 w-3" />
                          Cierre forzado
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selectedCaja} onOpenChange={(open) => !open && setSelectedCaja(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="h-5 w-5" />
              Cierre administrativo de caja
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Vas a cerrar de forma administrativa la sesión de caja del día{' '}
              <strong className="text-gray-700" suppressHydrationWarning>
                {selectedCaja && formatFechaLocal(selectedCaja.fecha)}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          {selectedCaja && (
            <form onSubmit={handleSubmit(onSubmitClose)} className="space-y-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo inicial</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(selectedCaja.saldoInicial)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">+ Ingresos</span>
                  <span className="font-semibold text-emerald-600">
                    +{formatCurrency(selectedCaja.totalIngresos)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">- Egresos</span>
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(selectedCaja.totalEgresos)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="font-bold text-gray-700">Saldo esperado</span>
                  <span className="font-black text-gray-900">
                    {formatCurrency(saldoEsperado)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Monto contado en caja (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('saldoFinal')}
                  className="h-10"
                />
                {errors.saldoFinal && (
                  <p className="text-xs text-red-500">{errors.saldoFinal.message}</p>
                )}
              </div>

              {saldoFinalNum > 0 && (
                <div
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold',
                    diferencia >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  )}
                >
                  <span>Diferencia</span>
                  <span>
                    {diferencia >= 0 ? '+' : ''}
                    {formatCurrency(diferencia)}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Motivo del cierre forzado</Label>
                <Input
                  {...register('motivo')}
                  placeholder="Ej. El cajero olvidó cerrar su caja"
                  className="h-10"
                />
                {errors.motivo && (
                  <p className="text-xs text-red-500">{errors.motivo.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Observaciones</Label>
                <Input
                  {...register('observaciones')}
                  placeholder="Ej. Sobrante, cuadre correcto, etc."
                  className="h-10"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCaja(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={cerrarForzado.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1"
                >
                  <Lock className="h-4 w-4" />
                  {cerrarForzado.isPending ? 'Cerrando...' : 'Confirmar cierre'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
