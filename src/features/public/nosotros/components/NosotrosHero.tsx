import { Heart } from 'lucide-react'
import { PageHero } from '@/features/public/shared/components/PageHero'

interface NosotrosHeroProps {
  aniosExperiencia: string
}

export function NosotrosHero({ aniosExperiencia }: NosotrosHeroProps) {
  const anios = aniosExperiencia.replace(/\D/g, '')

  return (
    <PageHero
      tone="dark"
      icon={Heart}
      containerClassName="max-w-4xl"
      title={
        <>
          Somos <span className="text-brand-azul">Kiki</span> y{' '}
          <span className="text-brand-rosa">Lala</span>
        </>
      }
      description={`Más de ${anios} años creando sonrisas, aventuras y recuerdos inolvidables para las familias de Chiclayo.`}
    />
  )
}
