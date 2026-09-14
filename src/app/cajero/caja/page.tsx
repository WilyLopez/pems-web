'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useCajaHoy,
  useResumenCaja,
  RegistrarMovimientoModal,
  AnularMovimientoModal,
  MovimientoCaja,
} from '@/features/admin/finanzas'
import {
  CajaStatusCard,
  AbrirCajaPanel,
  CerrarCajaPanel,
  RegistrarArqueoModal,
  MovimientosTable,
  ArqueosPanel,
} from '@/features/cajero'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'

export default function CajeroCajaPage() {
  const { idSede } = useAuth()

  const [showMov, setShowMov] = useState(false)
  const [showArqueo, setShowArqueo] = useState(false)
  const [movimientoAnular, setMovimientoAnular] =
    useState<MovimientoCaja | null>(null)

  const { data: caja, isLoading } = useCajaHoy(idSede ?? undefined)
  const { data: resumen } = useResumenCaja(caja?.id)

  const movimientos = resumen?.movimientos ?? []
  const arqueos = resumen?.arqueos ?? []
  const estaAbierta = caja?.estado === 'ABIERTA'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          title="Mi caja"
          description="Apertura, movimientos y cierre de tu sesión de caja"
        />

        {estaAbierta && caja && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMov(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Movimiento
            </Button>
            <Button
              asChild
              size="sm"
              className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              <Link href="/cajero/ventas/nueva">
                <ShoppingCart className="h-4 w-4" />
                Nueva venta
              </Link>
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : !caja ? (
        idSede ? (
          <AbrirCajaPanel idSede={idSede} />
        ) : (
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">
            Cargando identificador de sede...
          </div>
        )
      ) : (
        <>
          <CajaStatusCard caja={caja} />

          {estaAbierta ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Movimientos
                    </h3>
                  </div>
                  <MovimientosTable
                    movimientos={movimientos}
                    onAnular={setMovimientoAnular}
                  />
                </div>

                {arqueos.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Arqueos de la sesión
                    </h3>
                    <ArqueosPanel arqueos={arqueos} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <CerrarCajaPanel
                  caja={caja}
                  onArqueo={() => setShowArqueo(true)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Movimientos
                  </h3>
                </div>
                <MovimientosTable movimientos={movimientos} />
              </div>

              {arqueos.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Arqueos de la sesión
                  </h3>
                  <ArqueosPanel arqueos={arqueos} />
                </div>
              )}
            </div>
          )}

          {estaAbierta && caja && (
            <>
              <RegistrarArqueoModal
                open={showArqueo}
                onOpenChange={setShowArqueo}
                caja={caja}
              />
              <RegistrarMovimientoModal
                open={showMov}
                onOpenChange={setShowMov}
                idApertura={caja.id}
              />
              <AnularMovimientoModal
                movimiento={movimientoAnular}
                onClose={() => setMovimientoAnular(null)}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
