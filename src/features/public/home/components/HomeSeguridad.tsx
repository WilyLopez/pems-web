'use client'

import { Shield, Heart, Users, Zap } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { useContenidoPublico } from '@/features/public/shared/hooks/useContenidoPublico'

export function HomeSeguridad() {
  const { texto } = useContenidoPublico()
  const politicas = [
    {
      icon: Shield,
      titulo: 'Supervisión constante',
      desc: 'Personal capacitado en cada zona',
    },
    {
      icon: Heart,
      titulo: 'Higiene garantizada',
      desc: 'Desinfección después de cada turno',
    },
    {
      icon: Users,
      titulo: 'Personal certificado',
      desc: 'Entrenados en primeros auxilios',
    },
    {
      icon: Zap,
      titulo: 'Equipos seguros',
      desc: 'Revisión diaria de instalaciones',
    },
  ]

  return (
    <section className="py-20 bg-brand-gradient-dark text-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16 items-center">
          <Reveal>
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                {texto(
                  'home.seguridad.titulo',
                  'La seguridad de tus hijos, nuestra prioridad'
                )}
              </h2>
              <p className="text-white/85 leading-relaxed">
                {texto(
                  'home.seguridad.subtitulo',
                  'Cada rincón de Kiki y Lala está diseñado pensando en el bienestar de los niños'
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {politicas.map(({ icon: Icon, titulo, desc }) => (
                <div key={titulo} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-amarillo" />
                  </div>
                  <div>
                    <h3 className="font-bold">{titulo}</h3>
                    <p className="text-sm text-white/85 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
