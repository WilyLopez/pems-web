export const ANIO_FUNDACION_DEFAULT = 2023

export function calcularAniosExperiencia(anioFundacionTexto?: string): number {
  const anioFundacion = Number.parseInt(anioFundacionTexto ?? '', 10)
  const base = Number.isNaN(anioFundacion)
    ? ANIO_FUNDACION_DEFAULT
    : anioFundacion
  return Math.max(1, new Date().getFullYear() - base)
}
