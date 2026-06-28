import { DashboardFinanciero } from '@/features/admin/finanzas'

export type IngresoKey = 'ingresoReservas' | 'ingresoAdelantos' | 'ingresoManual'
export type EgresoKey = 'egresoFijo' | 'egresoVariable' | 'egresoEventual'

export interface DesgloseDef<K extends keyof DashboardFinanciero> {
  label: string
  key: K
  color: string
}

export const INGRESO_DESGLOSE: DesgloseDef<IngresoKey>[] = [
  { label: 'Reservas públicas', key: 'ingresoReservas', color: '#10b981' },
  { label: 'Adelantos eventos', key: 'ingresoAdelantos', color: '#00AEEF' },
  { label: 'Ingresos manuales', key: 'ingresoManual', color: '#FACC15' },
]

export const EGRESO_DESGLOSE: DesgloseDef<EgresoKey>[] = [
  { label: 'Fijo', key: 'egresoFijo', color: '#ef4444' },
  { label: 'Variable', key: 'egresoVariable', color: '#fb923c' },
  { label: 'Eventual', key: 'egresoEventual', color: '#facc15' },
]
