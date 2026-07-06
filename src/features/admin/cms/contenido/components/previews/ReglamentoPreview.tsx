import { AlertCircle, Shield } from 'lucide-react'
import { parseTextos } from '../../config/bloques'

export function ReglamentoPreview({
  valores,
}: {
  valores: Record<string, string>
}) {
  const items = parseTextos(valores['zona.reglamento.items'])

  return (
    <div className="bg-brand-rosa/5 p-6">
      <div className="mb-4 text-center">
        <Shield className="mx-auto mb-2 h-7 w-7 text-brand-rosa" />
        <h2 className="text-2xl font-black text-gray-900">
          {valores['zona.reglamento.titulo'] || 'Reglamento del local'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {valores['zona.reglamento.subtitulo'] ||
            'Para garantizar la seguridad y diversión de todos los niños'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.length === 0 ? (
          <p className="col-span-full text-center text-sm text-gray-400">
            Aún no hay normas. Agrega la primera.
          </p>
        ) : (
          items.map((regla, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-brand-rosa/10 bg-white p-4"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-brand-rosa" />
              <span className="text-sm font-medium text-gray-700">{regla}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
