import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { PageHero } from '@/features/public/shared/components/PageHero'

export function JuegosHero() {
  const { idSedeActiva } = useSedesPublicas()
  const idSede = idSedeActiva ?? 0
  const { data: configPublica } = useConfiguracionCalendarioPublica(idSede)

  const edadMin = configPublica?.edadMinCumple ?? 1
  const edadMax = configPublica?.edadMaxCumple ?? 12

  return (
    <PageHero
      tone="light"
      badge="Zona de Juegos"
      badgeColor="azul"
      accentClassName="bg-brand-azul"
      title={
        <>
          El mundo de diversión de{' '}
          <span className="text-brand-azul">Kiki y Lala</span>
        </>
      }
      description={`Atracciones para niños de ${edadMin} a ${edadMax} años. Diversión garantizada con la seguridad que merece tu familia.`}
      actions={
        <Button
          asChild
          size="lg"
          className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold px-10 gap-2"
        >
          <a
            href="#comprar"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById('comprar')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Ticket className="h-5 w-5" />
            Ver entradas
          </a>
        </Button>
      }
    />
  )
}
