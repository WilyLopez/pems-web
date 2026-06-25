import React from 'react'
import { Monitor, Globe, Smartphone } from 'lucide-react'

const CANAL_MAP: Record<string, { label: string; Icon: React.ElementType; cls: string }> = {
  MOSTRADOR: {
    label: 'Presencial',
    Icon: Monitor,
    cls: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  },
  WEB: {
    label: 'Web',
    Icon: Globe,
    cls: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
  },
  APP: {
    label: 'App',
    Icon: Smartphone,
    cls: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
  },
}

export const CanalBadge = ({ canal }: { canal: string }) => {
  const config = CANAL_MAP[canal]
  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
        {canal?.toLowerCase().replace('_', ' ') ?? '—'}
      </span>
    )
  }
  const { label, Icon, cls } = config
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}
