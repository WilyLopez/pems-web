import { AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function EmptyState({
  title,
  description,
  icon: Icon = AlertCircle,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border border-gray-100 max-w-md mx-auto my-6 space-y-4">
      <div className="w-12 h-12 bg-gray-200/50 rounded-2xl flex items-center justify-center text-gray-400">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-gray-950 text-base">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}
