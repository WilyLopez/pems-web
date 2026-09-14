'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { MovimientosTable } from '@/features/cajero/components/MovimientosTable'
import { ArqueosPanel } from '@/features/cajero/components/ArqueosPanel'
import { CajaActiva } from '../types'
import { formatCurrency } from '@/lib/utils'
import { MEDIOS_PAGO } from '@/lib/finance-constants'
import { Eye, ShoppingBag, Wallet } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  caja: CajaActiva | null | undefined
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function labelMedioPago(codigo: string) {
  return MEDIOS_PAGO.find((m) => m.value === codigo)?.label ?? codigo
}

export function VerCajaModal({ open, onOpenChange, caja }: Props) {
  if (!caja) return null

  const medios = Object.entries(caja.desglosePorMedioPago)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b sticky top-0 bg-white dark:bg-gray-950 z-10">
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <Eye className="h-5 w-5 text-brand-azul" />
            Caja de {caja.nombreCajero || 'cajero'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            Vista de solo lectura — abierta desde las{' '}
            {formatHora(caja.fechaApertura)}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              {caja.estado === 'ABIERTA' ? 'Caja abierta' : 'Caja cerrada'}
            </Badge>
            {caja.observaciones && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {caja.observaciones}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Saldo inicial', value: caja.saldoInicial },
              { label: 'Ingresos', value: caja.totalIngresos },
              { label: 'Egresos', value: caja.totalEgresos },
              { label: 'Saldo esperado', value: caja.saldoEsperado ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
              >
                <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                  {formatCurrency(value)}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-brand-azul" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Ventas del turno
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {caja.cantidadVentas} venta
                {caja.cantidadVentas !== 1 ? 's' : ''}
              </span>
              <span className="font-black text-gray-900 dark:text-gray-100">
                {formatCurrency(caja.totalVendido)}
              </span>
            </div>
            {medios.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  {medios.map(([codigo, monto]) => (
                    <div
                      key={codigo}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {labelMedioPago(codigo)}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {formatCurrency(monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Movimientos de caja
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <MovimientosTable movimientos={caja.movimientos} />
            </div>
          </div>

          {caja.arqueos.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Arqueos de la sesión
              </p>
              <ArqueosPanel arqueos={caja.arqueos} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
