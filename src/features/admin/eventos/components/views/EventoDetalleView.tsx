'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useEvento, useChecklist } from '../../hooks/useEventos'
import { calcularIndicadores } from '../../types'
import { EventoEstadoBadge } from '../ui/EventoEstadoBadge'
import { EventoAlertasBadges } from '../ui/EventoAlertasBadges'
import { ConfirmarEventoModal } from '@/components/admin/eventos/ConfirmarEventoModal'
import { ContratoCard } from '@/components/admin/contratos/ContratoCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDate } from '@/lib/utils'
import { ResumenTab } from '../detalle/ResumenTab'
import { PagosTab } from '../detalle/PagosTab'
import { RentabilidadTab } from '../detalle/RentabilidadTab'
import { ChecklistTab } from '../detalle/ChecklistTab'
import { EventoDetalleSidebar } from '../detalle/EventoDetalleSidebar'
import { CompletarEventoDialog } from '../dialogs/CompletarEventoDialog'
import { CancelarEventoDialog } from '../dialogs/CancelarEventoDialog'

interface EventoDetalleViewProps {
  idEvento: number
}

export function EventoDetalleView({ idEvento }: EventoDetalleViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabActivo = searchParams.get('tab') ?? 'resumen'

  function setTab(tab: string) {
    router.replace(`/admin/eventos/${idEvento}?tab=${tab}`)
  }

  const { data: evento, isLoading, isError, refetch } = useEvento(idEvento)
  const { data: checklist = [] } = useChecklist(idEvento)

  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [dialogCompletar, setDialogCompletar] = useState(false)
  const [dialogCancelar, setDialogCancelar] = useState(false)

  const completadas = checklist.filter((c) => c.completada).length
  const pctChecklist =
    checklist.length > 0
      ? Math.round((completadas / checklist.length) * 100)
      : 0
  const hoy = new Date().toISOString().slice(0, 10)
  const eventoFuturo = !!evento && String(evento.fechaEvento) > hoy

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Eventos', href: '/admin/eventos' },
          ...(evento ? [{ label: evento.tipoEvento }] : []),
        ]}
      />

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-72" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      )}

      {evento && (
        <>
          <PageHeader
            className="mb-0"
            title={evento.tipoEvento}
            description={`${evento.nombreCliente} · ${formatDate(evento.fechaEvento)}`}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <EventoEstadoBadge estado={evento.estado} />
                {evento.estado === 'SOLICITADA' && (
                  <Button
                    size="sm"
                    className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setModalConfirmar(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar evento
                  </Button>
                )}
                {evento.estado === 'CONFIRMADA' && (
                  <Button
                    size="sm"
                    className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
                    onClick={() => setDialogCompletar(true)}
                    disabled={eventoFuturo}
                    title={
                      eventoFuturo
                        ? `Disponible a partir del ${formatDate(evento.fechaEvento)}`
                        : undefined
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar completado
                  </Button>
                )}
                {(evento.estado === 'SOLICITADA' ||
                  evento.estado === 'CONFIRMADA') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setDialogCancelar(true)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            }
          />

          {calcularIndicadores(evento).length > 0 && (
            <div className="flex flex-wrap gap-2">
              <EventoAlertasBadges evento={evento} variant="badges" />
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs value={tabActivo} onValueChange={setTab}>
                <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <TabsTrigger value="resumen" className="rounded-lg text-xs">
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="pagos" className="rounded-lg text-xs">
                    Pagos
                  </TabsTrigger>
                  <TabsTrigger
                    value="rentabilidad"
                    className="rounded-lg text-xs"
                  >
                    Rentabilidad
                  </TabsTrigger>
                  <TabsTrigger value="checklist" className="rounded-lg text-xs">
                    Checklist
                    {pctChecklist < 100 && checklist.length > 0 && (
                      <span className="ml-1 bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 rounded-full">
                        {completadas}/{checklist.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contrato" className="rounded-lg text-xs">
                    Contrato
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="mt-4">
                  <ResumenTab evento={evento} />
                </TabsContent>

                <TabsContent value="pagos" className="mt-4">
                  <PagosTab evento={evento} idEvento={idEvento} />
                </TabsContent>

                <TabsContent value="rentabilidad" className="mt-4">
                  <RentabilidadTab idEvento={idEvento} />
                </TabsContent>

                <TabsContent value="contrato" className="mt-4">
                  <ContratoCard idEvento={idEvento} />
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  <ChecklistTab idEvento={idEvento} />
                </TabsContent>
              </Tabs>
            </div>

            <EventoDetalleSidebar
              evento={evento}
              onVerContrato={() => setTab('contrato')}
              onVerRentabilidad={() => setTab('rentabilidad')}
              onCancelar={() => setDialogCancelar(true)}
            />
          </div>

          <ConfirmarEventoModal
            evento={evento}
            open={modalConfirmar}
            onClose={() => setModalConfirmar(false)}
          />

          <CompletarEventoDialog
            open={dialogCompletar}
            onClose={() => setDialogCompletar(false)}
            idEvento={idEvento}
            montoSaldo={evento.montoSaldo ?? 0}
            checklistCompletadas={completadas}
            checklistTotal={checklist.length}
          />
        </>
      )}

      <CancelarEventoDialog
        open={dialogCancelar}
        onClose={() => setDialogCancelar(false)}
        idEvento={idEvento}
      />
    </div>
  )
}
