import React from 'react'

export const TipoVentaBadge = ({ tipo }: { tipo: string }) => {
  if (tipo === 'RESERVA') {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
        Entradas
      </span>
    )
  }
  if (tipo === 'ADELANTO_EVENTO') {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
        Evento
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
      {tipo}
    </span>
  )
}
