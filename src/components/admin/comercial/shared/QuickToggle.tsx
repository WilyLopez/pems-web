'use client'

import { cn } from '@/lib/utils'

interface QuickToggleProps {
  activo: boolean
  onToggle: () => void
  isPending?: boolean
  label?: boolean
}

export function QuickToggle({
  activo,
  onToggle,
  isPending,
  label = true,
}: QuickToggleProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all',
        activo
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isPending ? (
        <div className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
      ) : (
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            activo ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
      {label && (activo ? 'Activo' : 'Inactivo')}
    </button>
  )
}
