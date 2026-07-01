import { Ticket } from 'lucide-react'
import { Button } from '../../../../../components/ui/Button'
import { Badge } from '../../../../../components/ui/Badge'
import { useSedesPublicas } from '@/features/public/hooks/useSedesPublicas'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'

export function JuegosHero() {
  const { idSedeUnica, sedes } = useSedesPublicas()
  const idSede = idSedeUnica ?? sedes[0]?.id ?? 0
  const { data: configPublica } = useConfiguracionCalendarioPublica(idSede)

  const edadMin = configPublica?.edadMinCumple ?? 1
  const edadMax = configPublica?.edadMaxCumple ?? 12

  return (
    <section className="relative pt-24 pb-16 bg-gradient-to-br from-brand-azul/10 via-white to-brand-menta/10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-azul" />
      <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
        <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 text-sm px-4 py-1">
          Zona de Juegos
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
          El mundo de diversión de <span className="text-brand-azul">Kiki y Lala</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Atracciones para niños de {edadMin} a {edadMax} años. Diversión garantizada con la
          seguridad que merece tu familia.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold px-10 gap-2"
        >
          <a
            href="#comprar"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById('comprar')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <Ticket className="h-5 w-5" />
            Ver entradas
          </a>
        </Button>
      </div>
    </section>
  )
}
