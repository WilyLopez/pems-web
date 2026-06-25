import { ElementType, ReactNode } from 'react'

interface InfoRowProps {
  icon: ElementType
  label: string
  value?: string | number | null | ReactNode
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  )
}
