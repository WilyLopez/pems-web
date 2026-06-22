import React from 'react'

export const TipoVentaBadge = ({ tipo }: { tipo: string }) => {
  const isReserva = tipo === 'RESERVA'
  const isAdelanto = tipo === 'ADELANTO_EVENTO'
  
  if (isReserva) {
    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">Entradas</span>
  }
  if (isAdelanto) {
    return <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">Evento</span>
  }
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-700">{tipo}</span>
}
