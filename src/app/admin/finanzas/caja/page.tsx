'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ShoppingCart, Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useCajaHoy,
  useMovimientosCaja,
  useArqueosCaja,
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
  CajaHistorialPanel,
} from '@/features/cajero'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'

export default function CajaPage() {
  const { idSede } = useAuth()
  const hoy = new Date().toISOString().slice(0, 10)

  const [showMov, setShowMov] = useState(false)
  const [showArqueo, setShowArqueo] = useState(false)
  const [movimientoAnular, setMovimientoAnular] =
    useState<MovimientoCaja | null>(null)

  const { data: caja, isLoading } = useCajaHoy(idSede ?? undefined)

  const { data: movimientos = [] } = useMovimientosCaja(caja?.id)
  const { data: arqueos = [] } = useArqueosCaja(caja?.id)

  const estaAbierta = caja?.estado === 'ABIERTA'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          title="Caja"
          description="Apertura, movimientos y cierre de tu sesión de caja"
        />
      </div>

      <Tabs defaultValue="caja-dia" className="space-y-6">
        <TabsList className="bg-gray-100/80 p-1 rounded-xl w-fit flex gap-1">
          <TabsTrigger
            value="caja-dia"
            className="font-bold data-[state=active]:bg-brand-azul data-[state=active]:text-white transition-all duration-200"
          >
            Mi caja
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="font-bold data-[state=active]:bg-brand-azul data-[state=active]:text-white transition-all duration-200"
          >
            Historial de sesiones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="caja-dia" className="space-y-6 mt-0">
          {estaAbierta && caja && (
            <div className="flex justify-end items-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link href={`/admin/finanzas/caja/movimientos?fecha=${hoy}`}>
                  <Receipt className="h-4 w-4" />
                  Ver movimientos
                </Link>
              </Button>
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
                <Link href="/admin/ventas/nueva?from=caja">
                  <ShoppingCart className="h-4 w-4" />
                  Nueva venta
                </Link>
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse"
                />
              ))}
            </div>
          ) : !caja ? (
            idSede ? (
              <AbrirCajaPanel idSede={idSede} />
            ) : (
              <div className="text-center text-sm text-gray-400 py-12">
                Cargando identificador de sede...
              </div>
            )
          ) : (
            <>
              <CajaStatusCard caja={caja} />

              {estaAbierta ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="px-5 py-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Movimientos
                        </h3>
                      </div>
                      <MovimientosTable
                        movimientos={movimientos}
                        onAnular={setMovimientoAnular}
                      />
                    </div>

                    {arqueos.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
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
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Movimientos
                      </h3>
                    </div>
                    <MovimientosTable movimientos={movimientos} />
                  </div>

                  {arqueos.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">
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
        </TabsContent>

        <TabsContent value="historial" className="space-y-6 mt-0">
          {idSede ? (
            <CajaHistorialPanel idSede={idSede} />
          ) : (
            <div className="text-center text-sm text-gray-400 py-12">
              Cargando identificador de sede...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
