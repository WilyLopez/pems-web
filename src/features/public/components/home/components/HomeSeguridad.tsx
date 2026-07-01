import { Shield, Heart, Users, Zap } from 'lucide-react'

export function HomeSeguridad() {
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
    <section className="py-16 bg-brand-gradient text-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">
            La seguridad de tus hijos, nuestra prioridad
          </h2>
          <p className="text-white/80">
            Cada rincón de Kiki y Lala está diseñado pensando en el bienestar
            de los niños
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {politicas.map(({ icon: Icon, titulo, desc }) => (
            <div
              key={titulo}
              className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold mb-1">{titulo}</h3>
              <p className="text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
