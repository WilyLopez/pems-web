'use client'

import Link from 'next/link'
import { Gamepad2, PartyPopper, ArrowRight, Ticket } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'

const productos = [
  {
    href: '/juegos',
    icon: Gamepad2,
    badge: 'Día de juegos',
    titulo: 'Zona de juegos',
    desc: 'Atracciones seguras para cada edad, horarios flexibles y entrada al instante. El plan perfecto para un día lleno de energía.',
    cta: 'Reservar entrada',
    ctaIcon: Ticket,
    accent: 'bg-brand-azul',
    accentSoft: 'bg-brand-azul/10',
    accentText: 'text-brand-azul',
    ring: 'hover:border-brand-azul/40',
    gradient: 'from-brand-azul/15 to-brand-menta/10',
  },
  {
    href: '/celebraciones',
    icon: PartyPopper,
    badge: 'Eventos privados',
    titulo: 'Celebraciones',
    desc: 'Cumpleaños, baby showers y eventos temáticos con coordinación completa. Nosotros organizamos, tú solo disfrutas.',
    cta: 'Ver paquetes',
    ctaIcon: ArrowRight,
    accent: 'bg-brand-rosa',
    accentSoft: 'bg-brand-rosa/10',
    accentText: 'text-brand-rosa',
    ring: 'hover:border-brand-rosa/40',
    gradient: 'from-brand-rosa/15 to-brand-amarillo/10',
  },
]

export function HomeProductos() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          badge="Elige tu experiencia"
          badgeColor="rosa"
          titleClassName="text-4xl"
          title="Dos formas de vivir Kiki y Lala"
          description="Ven a jugar cualquier día o celebra tu evento privado con nosotros."
          className="mb-12"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {productos.map((p, i) => {
            const Icon = p.icon
            const CtaIcon = p.ctaIcon
            return (
              <Reveal key={p.href} delay={i * 0.08} className="h-full">
                <Link
                  href={p.href}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br ${p.gradient} p-8 transition-all hover:-translate-y-1 hover:shadow-brand ${p.ring}`}
                >
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${p.accentSoft}`}
                  >
                    <Icon className={`h-7 w-7 ${p.accentText}`} />
                  </div>

                  <span
                    className={`mb-2 text-xs font-black uppercase tracking-wider ${p.accentText}`}
                  >
                    {p.badge}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {p.desc}
                  </p>

                  <span
                    className={`mt-6 inline-flex items-center gap-2 self-start rounded-full ${p.accent} px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform group-hover:gap-3`}
                  >
                    <CtaIcon className="h-4 w-4" />
                    {p.cta}
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
