import React from 'react'

interface EstadoVentaBadgeProps {
  total: number
  pagado?: number
}

export const EstadoVentaBadge = ({ total, pagado }: EstadoVentaBadgeProps) => {
  const montoPagado = pagado ?? 0
  const isPagada = montoPagado >= total

  if (isPagada) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-300">
        Pagada
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
      Pendiente
    </span>
  )
}
