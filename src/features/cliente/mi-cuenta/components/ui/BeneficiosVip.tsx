import { Star, Check, TrendingUp } from 'lucide-react'
import { Cliente, EventoPrivado } from '../../../shared/types'
import { Separator } from '@/components/ui/Separator'
import { cn, formatCurrency } from '@/lib/utils'
import { FRECUENTE_THRESHOLD } from '../../../shared/constants'

interface BeneficiosVipProps {
  cliente: Cliente
  eventos: EventoPrivado[]
}

export function BeneficiosVip({ cliente, eventos }: BeneficiosVipProps) {
  const visitas = cliente.contadorVisitas

  if (cliente.esVip) {
    const descuento = cliente.descuentoVip ?? 0
    const ahorrado =
      cliente.totalGastado != null && descuento > 0
        ? cliente.totalGastado * (descuento / 100)
        : null

    return (
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Cliente VIP</p>
            <p className="text-xs text-amber-700">
              {descuento}% de descuento activo
            </p>
          </div>
        </div>
        <Separator className="border-amber-200" />
        <div className="space-y-1.5">
          {[
            'Descuento exclusivo en todas las reservas',
            'Acceso a preventas y fechas especiales',
            'Atención prioritaria',
          ].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-xs text-gray-700">{b}</span>
            </div>
          ))}
        </div>
        {ahorrado != null && ahorrado > 0 && (
          <div className="bg-white/70 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-500">Ahorro acumulado estimado</p>
            <p className="text-base font-black text-amber-600">
              {formatCurrency(ahorrado)}
            </p>
          </div>
        )}
      </div>
    )
  }

  const progreso = Math.min((visitas / FRECUENTE_THRESHOLD) * 100, 100)
  const faltan = Math.max(FRECUENTE_THRESHOLD - visitas, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-azul/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-brand-azul" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            Programa de fidelidad
          </p>
          <p className="text-xs text-gray-500">
            {cliente.segmentoCodigo === 'FRECUENTE'
              ? 'Cliente frecuente'
              : 'Cliente nuevo'}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{visitas} visitas</span>
          <span className="font-semibold text-brand-azul">
            {FRECUENTE_THRESHOLD} para frecuente
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-azul rounded-full transition-all duration-700"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {faltan > 0
          ? `Te faltan ${faltan} visitas para convertirte en cliente frecuente.`
          : 'Ya eres cliente frecuente. Habla con nuestro equipo sobre beneficios VIP.'}
      </p>
    </div>
  )
}
