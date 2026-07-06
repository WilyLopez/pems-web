import { Zap } from 'lucide-react'

export function HeroPreview({ valores }: { valores: Record<string, string> }) {
  return (
    <div className="bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] p-6 text-white">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-amarillo">
        <Zap className="h-3.5 w-3.5" />
        {valores['home.hero.badge'] || 'Etiqueta superior'}
      </div>
      <h1 className="mt-4 text-3xl font-black leading-none">
        <span className="text-white">
          {valores['home.hero.titulo_linea1'] || 'Título'}
        </span>
        <br />
        <span className="text-brand-azul">
          {valores['home.hero.titulo_linea2'] || 'destacado'}
        </span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
        {valores['home.hero.parrafo'] || 'Descripción del bloque...'}
      </p>
    </div>
  )
}
