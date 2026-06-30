import { CheckCircle2 } from 'lucide-react'
import { Cliente } from '../../../shared/types'
import { cn } from '@/lib/utils'

interface PerfilCompletadoProps {
  cliente: Cliente
}

function calcularCompletitud(cliente: Cliente): {
  porcentaje: number
  pendientes: string[]
} {
  const items = [
    { completo: !!cliente.telefono, label: 'Teléfono' },
    { completo: !!cliente.numeroDocumento, label: 'Nro de documento' },
    { completo: !!cliente.apellidoMaterno, label: 'Apellido materno' },
    { completo: !!cliente.fechaNacimiento, label: 'Fecha de nacimiento' },
  ]
  const completados = items.filter((i) => i.completo).length
  return {
    porcentaje: Math.round((completados / items.length) * 100),
    pendientes: items.filter((i) => !i.completo).map((i) => i.label),
  }
}

export function PerfilCompletado({ cliente }: PerfilCompletadoProps) {
  const { porcentaje, pendientes } = calcularCompletitud(cliente)
  const completo = porcentaje === 100

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Perfil completado</p>
        <span
          className={cn(
            'text-sm font-black',
            porcentaje === 100 ? 'text-green-600' : 'text-brand-azul'
          )}
        >
          {porcentaje}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            completo ? 'bg-green-500' : 'bg-brand-azul'
          )}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {completo ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-semibold">
            Perfil al 100%. Todo listo.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-[11px] text-gray-500">
            Completa tu perfil para una mejor experiencia.
          </p>
          {pendientes.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              <span className="text-xs text-gray-500">{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
