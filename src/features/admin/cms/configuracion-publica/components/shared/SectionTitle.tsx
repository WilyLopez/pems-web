import type { LucideIcon } from 'lucide-react'

interface Props {
  icon:  LucideIcon
  label: string
}

export function SectionTitle({ icon: Icon, label }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
      <div className="w-5 h-5 rounded bg-brand-azul/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-brand-azul" />
      </div>
      {label}
    </div>
  )
}
