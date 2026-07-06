import { Star } from 'lucide-react'

export function HeroStatsPreview({
  valores,
}: {
  valores: Record<string, string>
}) {
  const anioFundacion = Number.parseInt(
    valores['home.hero.stats.anio_fundacion'] || '2023',
    10
  )
  const aniosExperiencia = Math.max(
    1,
    new Date().getFullYear() -
      (Number.isNaN(anioFundacion) ? 2023 : anioFundacion)
  )

  return (
    <div className="bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] p-6 text-white">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-black text-brand-amarillo">
            {valores['home.hero.stats.familias'] || '+500'}
          </div>
          <div className="text-[11px] text-white/60">Familias felices</div>
        </div>
        <div className="h-9 w-px bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-black text-brand-azul">
            {valores['home.hero.stats.calificacion'] || '4.9'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/60">
            <Star className="h-2.5 w-2.5 fill-brand-amarillo text-brand-amarillo" />
            Calificación
          </div>
        </div>
        <div className="h-9 w-px bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-black text-brand-menta">
            +{aniosExperiencia}
          </div>
          <div className="text-[11px] text-white/60">Años de experiencia</div>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-white/50">
        Este número se calcula solo cada año a partir del año de fundación — no
        necesitas editarlo manualmente.
      </p>
    </div>
  )
}
