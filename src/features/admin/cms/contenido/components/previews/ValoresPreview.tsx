import { Shield, Heart, Star, Sparkles } from 'lucide-react'
import { parseValores } from '../../config/bloques'

const ESTILOS = [
  { Icono: Shield, color: 'text-brand-azul', fondo: 'bg-brand-azul/10' },
  { Icono: Heart, color: 'text-brand-rosa', fondo: 'bg-brand-rosa/10' },
  { Icono: Star, color: 'text-yellow-600', fondo: 'bg-brand-amarillo/15' },
  { Icono: Sparkles, color: 'text-brand-menta', fondo: 'bg-brand-menta/20' },
]

export function ValoresPreview({
  valores,
}: {
  valores: Record<string, string>
}) {
  const items = parseValores(valores['nosotros.valores.items'])

  return (
    <div className="bg-gray-50 p-6 text-center">
      <h2 className="text-2xl font-black text-gray-900">
        {valores['nosotros.valores.titulo'] || 'Título'}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full text-sm text-gray-400">
            Aún no hay valores. Agrega el primero.
          </p>
        ) : (
          items.map((valor, i) => {
            const estilo = ESTILOS[i % ESTILOS.length]
            const Icono = estilo.Icono
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm"
              >
                <div
                  className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${estilo.fondo}`}
                >
                  <Icono className={`h-4 w-4 ${estilo.color}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {valor.titulo || 'Título'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {valor.descripcion}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
