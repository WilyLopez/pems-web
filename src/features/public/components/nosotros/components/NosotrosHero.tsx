import { Heart } from 'lucide-react'

interface NosotrosHeroProps {
  aniosExperiencia: string
}

export function NosotrosHero({ aniosExperiencia }: NosotrosHeroProps) {
  const anios = aniosExperiencia.replace(/\D/g, '')

  return (
    <section className="relative pt-24 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-brand-rosa/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
      </div>
      <div className="container max-w-4xl mx-auto px-4 text-center space-y-5 relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight">
          Somos <span className="text-brand-azul">Kiki</span> y{' '}
          <span className="text-brand-rosa">Lala</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
          Más de {anios} años creando sonrisas, aventuras y recuerdos inolvidables para las familias de Chiclayo.
        </p>
      </div>
    </section>
  )
}
