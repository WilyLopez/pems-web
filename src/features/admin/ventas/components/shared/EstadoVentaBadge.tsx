import React from 'react'

export const EstadoVentaBadge = ({ total, pagado }: { total: number; pagado: number }) => {
  const isPagada = pagado >= total
  
  if (isPagada) {
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">Completada</span>
  }
  
  return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">Pendiente</span>
}
