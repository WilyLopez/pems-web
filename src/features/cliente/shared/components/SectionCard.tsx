import { cn } from '@/lib/utils'

interface SectionCardProps {
  titulo: string
  icon: React.ElementType
  children: React.ReactNode
  accion?: React.ReactNode
}

export function SectionCard({ titulo, icon: Icon, children, accion }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-brand-azul" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">{titulo}</h2>
        </div>
        {accion}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}
