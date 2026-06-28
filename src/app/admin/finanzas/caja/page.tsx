'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Lock, ShoppingCart, Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useCaja,
  useCajaHoy,
  useMovimientosCaja,
  useArqueosCaja,
  RegistrarMovimientoModal,
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
import { Input } from '@/components/ui/Input'

export default function CajaPage() {
  const { idSede } = useAuth()
  const hoy = new Date().toISOString().slice(0, 10)

  const [fecha, setFecha] = useState(hoy)
  const [showMov, setShowMov] = useState(false)
  const [showArqueo, setShowArqueo] = useState(false)

  const esHoy = fecha === hoy

  const { data: cajaHoy, isLoading: loadingHoy } = useCajaHoy(
    esHoy ? (idSede ?? undefined) : undefined
  )
  const { data: cajaHistorica, isLoading: loadingHistorica } = useCaja(
    esHoy ? undefined : (idSede ?? undefined),
    esHoy ? undefined : fecha
  )

  const caja = esHoy ? cajaHoy : cajaHistorica
  const isLoading = esHoy ? loadingHoy : loadingHistorica

  const { data: movimientos = [] } = useMovimientosCaja(caja?.id)
  const { data: arqueos = [] } = useArqueosCaja(caja?.id)

  const estaAbierta = caja?.estado === 'ABIERTA'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          title="Caja"
          description="Control de apertura, movimientos y cierre por día"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-9 w-40"
          />
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={`/admin/finanzas/caja/movimientos?fecha=${fecha}`}>
              <Receipt className="h-4 w-4" />
              Ver movimientos
            </Link>
          </Button>
          {estaAbierta && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMov(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Movimiento
            </Button>
          )}
          {estaAbierta && (
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
          )}
        </div>
      </div>

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
        esHoy ? (
          <AbrirCajaPanel idSede={idSede!} fecha={fecha} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-2">
            <Lock className="mx-auto h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">
              No hay caja registrada para esta fecha.
            </p>
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
                  <MovimientosTable movimientos={movimientos} />
                </div>

                {arqueos.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Arqueos del día
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
                    Arqueos del día
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
            </>
          )}
        </>
      )}
    </div>
  )
}
