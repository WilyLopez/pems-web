import { AlertCircle, Shield } from 'lucide-react'
import { ConfiguracionPublica } from '../../../../../types/configuracion-publica.types'

interface JuegosReglasProps {
  config: ConfiguracionPublica | undefined
}

export function JuegosReglas({ config }: JuegosReglasProps) {
  let reglasList = [
    'Niños de 1 a 12 años',
    'Calcetines obligatorios para todos',
    'Prohibido ingresar con comida externa',
    'Adultos deben permanecer en el local',
    'Sin objetos punzantes o peligrosos',
    'Respetar el aforo por zona',
  ]

  if (config?.reglasLocal) {
    try {
      const parsed = JSON.parse(config.reglasLocal)
      if (Array.isArray(parsed)) {
        reglasList = parsed
      } else if (parsed.normas && Array.isArray(parsed.normas)) {
        reglasList = parsed.normas
      }
    } catch {}
  }

  return (
    <section className="py-16 bg-brand-rosa/5">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Shield className="h-8 w-8 text-brand-rosa mx-auto mb-2" />
          <h2 className="text-3xl font-black text-gray-900">
            Reglamento del local
          </h2>
          <p className="text-gray-600 mt-1">
            Para garantizar la seguridad y diversión de todos los niños
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {reglasList.map((r) => (
            <div
              key={r}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-brand-rosa/10"
            >
              <AlertCircle className="h-4 w-4 text-brand-rosa shrink-0" />
              <span className="text-sm font-medium text-gray-700">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
