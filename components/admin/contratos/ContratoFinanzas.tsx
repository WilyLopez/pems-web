import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { Contrato } from '@/types/contrato.types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ContratoFinanzasProps {
  contrato: Contrato
}

export function ContratoFinanzas({ contrato }: ContratoFinanzasProps) {
  const total     = contrato.precioTotalContrato ?? 0
  const adelanto  = contrato.montoAdelanto       ?? 0
  const saldo     = contrato.saldoPendiente      ?? 0
  const pct       = total > 0 ? Math.round((adelanto / total) * 100) : 0

  if (!total) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-brand-azul" />
        </div>
        <h3 className="font-bold text-sm text-gray-900">Estado financiero</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total contratado</span>
          <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Adelanto recibido</span>
          <span className="font-semibold text-green-700">{formatCurrency(adelanto)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Pagado</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-brand-azul' : 'bg-amber-400',
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {saldo > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Saldo pendiente</p>
              <p className="text-sm font-black text-amber-900">{formatCurrency(saldo)}</p>
            </div>
          </div>
        )}
        {saldo === 0 && total > 0 && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-xs font-bold text-green-800">Pago completo</p>
          </div>
        )}
      </div>
    </div>
  )
}