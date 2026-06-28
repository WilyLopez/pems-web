'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const REFRESCO_ETIQUETA_MS = 1000 * 15

interface EnVivoIndicatorProps {
  enVivo: boolean
  actualizadoEn?: number
  cargando?: boolean
}

export function EnVivoIndicator({
  enVivo,
  actualizadoEn,
  cargando = false,
}: EnVivoIndicatorProps) {
  const [, forzarRender] = useState(0)

  useEffect(() => {
    if (!actualizadoEn) return
    const id = setInterval(() => forzarRender((n) => n + 1), REFRESCO_ETIQUETA_MS)
    return () => clearInterval(id)
  }, [actualizadoEn])

  const etiquetaTiempo = actualizadoEn
    ? formatDistanceToNow(actualizadoEn, { locale: es, addSuffix: true })
    : null

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <span className="relative flex h-2 w-2">
        {enVivo && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              cargando ? 'animate-ping bg-emerald-400' : 'bg-emerald-400/0'
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            enVivo
              ? 'bg-emerald-500'
              : 'bg-gray-300 dark:bg-gray-600'
          )}
        />
      </span>
      <span className="font-semibold">{enVivo ? 'En vivo' : 'Pausado'}</span>
      {etiquetaTiempo && (
        <span className="hidden sm:inline">· Actualizado {etiquetaTiempo}</span>
      )}
    </div>
  )
}
