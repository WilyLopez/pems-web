import { DashboardFinanciero } from '@/features/admin/finanzas'
import { DesgloseDef } from '../config'

export function margenPct(utilidad: number, ingresos: number): number {
  if (ingresos <= 0) return 0
  return (utilidad / ingresos) * 100
}

export function porcentaje(parte: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((parte / total) * 100)
}

export interface DesgloseItem {
  label: string
  value: number
  color: string
}

export function construirDesglose<K extends keyof DashboardFinanciero>(
  data: DashboardFinanciero,
  defs: DesgloseDef<K>[]
): DesgloseItem[] {
  return defs.map((d) => ({
    label: d.label,
    value: Number(data[d.key]),
    color: d.color,
  }))
}
