interface PrecioLabelProps {
  tipoDia?: string
  precioMap?: Record<string, number>
}

export function PrecioLabel({ tipoDia, precioMap }: PrecioLabelProps) {
  const precio =
    tipoDia && precioMap
      ? (precioMap[tipoDia] ?? (tipoDia === 'SEMANA' ? 25 : 35))
      : tipoDia === 'SEMANA'
        ? 25
        : 35

  return (
    <span className="font-black text-brand-azul">
      S/ {Number(precio).toFixed(2)}
    </span>
  )
}
