'use client'

interface Props {
  label: string
  valor: React.ReactNode
}

export function FilaResumen({ label, valor }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{valor}</span>
    </div>
  )
}
