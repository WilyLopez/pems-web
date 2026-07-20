import { Separator } from '@/components/ui/Separator'
import { formatCurrency } from '@/lib/utils'
import { useResumenEvento, GastosEventoPanel } from '@/features/admin/finanzas'

interface RentabilidadTabProps {
  idEvento: number
}

export function RentabilidadTab({ idEvento }: RentabilidadTabProps) {
  const { data: resumenFinanciero } = useResumenEvento(idEvento)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        Rentabilidad del evento
      </h3>
      {resumenFinanciero ? (
        (() => {
          const margen =
            resumenFinanciero.ingresoContrato > 0
              ? (resumenFinanciero.utilidadBruta /
                  resumenFinanciero.ingresoContrato) *
                100
              : 0
          const positivo = resumenFinanciero.utilidadBruta >= 0
          return (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Ingreso contrato',
                    value: resumenFinanciero.ingresoContrato,
                    color: 'text-gray-900 dark:text-gray-100',
                  },
                  {
                    label: 'Adelanto recibido',
                    value: resumenFinanciero.montoAdelanto,
                    color: 'text-blue-700 dark:text-blue-400',
                  },
                  {
                    label: 'Gastos adicionales',
                    value: resumenFinanciero.totalGastosAdicionales,
                    color: 'text-orange-600 dark:text-orange-400',
                  },
                  {
                    label: 'Utilidad bruta',
                    value: resumenFinanciero.utilidadBruta,
                    color: positivo
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-0.5"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {label}
                    </p>
                    <p className={`text-base font-black ${color}`}>
                      {formatCurrency(value)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Margen bruto</span>
                  <span
                    className={`font-black ${positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {margen.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${positivo ? 'bg-emerald-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(Math.abs(margen), 100)}%` }}
                  />
                </div>
              </div>
              <Separator />
              <GastosEventoPanel
                idEvento={idEvento}
                resumen={resumenFinanciero}
              />
            </>
          )
        })()
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          El precio del contrato aun no ha sido definido.
        </p>
      )}
    </div>
  )
}
