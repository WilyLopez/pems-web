import { Cake } from 'lucide-react'
import { DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'

export interface TipoEventoItem {
  icon: string | React.ElementType | undefined
  nombre: string
  desc: string
}

export function TiposEvento({ tipos }: { tipos: TipoEventoItem[] }) {
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          title="¿Qué tipo de evento quieres celebrar?"
          className="mb-10"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map(({ icon, nombre, desc }) => {
            return (
              <div
                key={nombre}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-brand-rosa/30 hover:shadow-brand transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0 group-hover:bg-brand-rosa group-hover:text-white transition-colors">
                  {typeof icon === 'string' ? (
                    <DynamicIcon
                      name={icon}
                      className="h-5 w-5 text-brand-rosa group-hover:text-white"
                      fallback={Cake}
                    />
                  ) : (
                    (() => {
                      const IconComponent = icon as React.ElementType
                      return (
                        <IconComponent className="h-5 w-5 text-brand-rosa group-hover:text-white" />
                      )
                    })()
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
