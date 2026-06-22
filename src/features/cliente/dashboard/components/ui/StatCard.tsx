'use client'

import { cn } from '@/lib/utils'

interface StatCardProps {
  valor: string | number
  label: string
  icon: React.ElementType
  color: string
}

export function StatCard({ valor, label, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={cn(
          'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2',
          color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">{valor}</p>
      <p className="text-[11px] sm:text-xs text-gray-400 mt-1 leading-tight">{label}</p>
    </div>
  )
}
