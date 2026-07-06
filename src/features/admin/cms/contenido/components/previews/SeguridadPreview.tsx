import { Heart, Shield, Users, Zap } from 'lucide-react'

const ICONOS = [Shield, Heart, Users, Zap]

export function SeguridadPreview({
  valores,
}: {
  valores: Record<string, string>
}) {
  return (
    <div className="bg-brand-gradient p-6 text-center text-white">
      <h2 className="text-xl font-black">
        {valores['home.seguridad.titulo'] || 'Título'}
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-white/80">
        {valores['home.seguridad.subtitulo'] || 'Subtítulo'}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {ICONOS.map((Icono, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-3"
          >
            <Icono className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
