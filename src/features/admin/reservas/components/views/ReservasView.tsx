'use client'

import React, { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

import { useReservasNav } from '../../hooks/useReservasNav'
import { useReservas, useMetricasReservas } from '../../hooks/useReservasData'

import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/common/Errorstate'

import { ReservasMetrics } from '../ui/ReservasMetrics'
import { ReservasFilters } from '../ui/ReservasFilters'
import { ReservasTable } from '../table/ReservasTable'
import { ReservaDrawer } from '../drawer/ReservaDrawer'
import { CancelarDialog } from '../actions/CancelarDialog'
import { IngresoDialog } from '../actions/IngresoDialog'
import { ValidarPagoDialog } from '../actions/ValidarPagoDialog'
import { FidelizacionConfigModal } from '../actions/FidelizacionConfigModal'
import { EstadoReservaInfoModal } from '../actions/EstadoReservaInfoModal'
import { EliminarDialog } from '../actions/EliminarDialog'
import { Star, Info } from 'lucide-react'

export const ReservasView = React.memo(() => {
  const { idSede } = useAuth()
  const {
    page,
    size,
    search,
    estado,
    fecha,
    medioPago,
    ingresado,
    modal,
    actionId,
    drawerId,
    setPage,
    setSize,
    setSearch,
    setEstado,
    setFecha,
    setIngresado,
    setMedioPago,
    setYapePendiente,
    clearFilters,
    openAction,
    openDrawer,
    openFidelizacion,
    openEstados,
    closeAll,
  } = useReservasNav()



  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const esYapePendiente = params.get('medioPago') === 'YAPE' && params.get('estado') === 'PENDIENTE'
    if (!params.has('fecha') && !esYapePendiente) {
      const d = new Date()
      const offset = d.getTimezoneOffset()
      const local = new Date(d.getTime() - offset * 60 * 1000)
      const hoyStr = local.toISOString().split('T')[0]
      setFecha(hoyStr)
    }
  }, [setFecha])



  const { data, isLoading, isError, refetch } = useReservas({
    page,
    size,
    idSede: idSede ?? undefined,
    estado: estado || undefined,
    fecha: fecha || undefined,
    ingresado,
    medioPago: medioPago || undefined,
    search: search || undefined,
  })


  const { data: metricas } = useMetricasReservas(
    idSede ?? undefined,
    fecha || undefined
  )

  const cantidadYapePendientes = useMemo(() => {
    return (
      data?.content.filter(
        (r) => r.estado === 'PENDIENTE' && r.medioPago === 'YAPE'
      ).length ?? 0
    )
  }, [data])

  const activeReserva = useMemo(() => {
    if (!actionId) return undefined
    return data?.content.find((r) => r.id === actionId)
  }, [data, actionId])

  const drawerReserva = useMemo(() => {
    if (!drawerId) return undefined
    return data?.content.find((r) => r.id === drawerId)
  }, [data, drawerId])

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Reservas' }]} />

      <PageHeader
        title="Reservas"
        description="Gestion operativa de reservas y control de acceso al local"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openEstados}
              className="rounded-xl gap-1.5 border-blue-200 hover:bg-blue-50 text-blue-700"
            >
              <Info className="h-4 w-4" />
              Estados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openFidelizacion}
              className="rounded-xl gap-1.5 border-yellow-200 hover:bg-yellow-50 text-yellow-700"
            >
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              Fidelizacion
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        }
      />

      <ReservasMetrics metricas={metricas} />

      <ReservasFilters
        search={search}
        estado={estado}
        fecha={fecha}
        ingresado={ingresado}
        medioPago={medioPago}
        yapePendienteCount={cantidadYapePendientes}
        onSearchChange={setSearch}
        onEstadoChange={setEstado}
        onFechaChange={setFecha}
        onIngresadoChange={setIngresado}
        onMedioPagoChange={setMedioPago}
        onToggleYapePendiente={setYapePendiente}
        onClearFilters={clearFilters}
      />



      <ReservasTable
        data={data}
        isLoading={isLoading}
        page={page}
        size={size}
        onPageChange={setPage}
        onSizeChange={setSize}
        onViewReserva={openDrawer}
        onActionReserva={openAction}
      />


      <CancelarDialog
        open={modal === 'cancelar'}
        onClose={closeAll}
        reservaId={actionId ?? undefined}
        numeroTicket={activeReserva?.numeroTicket}
      />

      <IngresoDialog
        open={modal === 'ingreso'}
        onClose={closeAll}
        reservaId={actionId ?? undefined}
        numeroTicket={activeReserva?.numeroTicket}
      />

      <ValidarPagoDialog
        open={modal === 'validar-yape'}
        onClose={closeAll}
        reserva={activeReserva}
      />

      <EliminarDialog
        open={modal === 'eliminar'}
        onClose={closeAll}
        reservaId={actionId ?? undefined}
      />

      <FidelizacionConfigModal
        open={modal === 'fidelizacion'}
        onClose={closeAll}
        idSede={idSede ?? undefined}
      />

      <EstadoReservaInfoModal open={modal === 'estados'} onClose={closeAll} />

      <ReservaDrawer
        reserva={drawerReserva ?? null}
        onClose={closeAll}
        onValidarYape={(id) => openAction('validar-yape', id)}
      />
    </div>
  )
})

ReservasView.displayName = 'ReservasView'
