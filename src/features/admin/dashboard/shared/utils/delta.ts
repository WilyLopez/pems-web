export function variacionPct(
  actual: number,
  anterior: number | null | undefined
): number | null {
  if (!anterior || anterior <= 0) return null
  return Math.round(((actual - anterior) / anterior) * 100)
}
