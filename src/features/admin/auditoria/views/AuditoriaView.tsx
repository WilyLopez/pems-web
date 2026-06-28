'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuditoriaFiltros } from '../hooks/useAuditoriaFiltros'
import { useAuditoriaLista } from '../hooks/useAuditoriaLista'
import { FiltrosPanel } from '../components/FiltrosPanel'
import { FiltrosAvanzados } from '../components/FiltrosAvanzados'
import { AuditoriaTable } from '../components/AuditoriaTable'
import { LogDetalleModal } from '../components/LogDetalleModal'

export function AuditoriaView() {
  const {
    filtros,
    page,
    setPage,
    actualizarFiltro,
    limpiar,
    tieneFiltrosActivos,
  } = useAuditoriaFiltros()
  const filtrosDebounced = useDebounce(filtros, 400)
  const [logSeleccionado, setLogSeleccionado] = useState<number | null>(null)

  const { data, isLoading, isError } = useAuditoriaLista(filtrosDebounced, page)

  useEffect(() => {
    if (isError)
      toast.error('No se pudieron cargar los registros de auditoría.')
  }, [isError])

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Auditoría' }]} />

      <PageHeader
        title="Auditoría"
        description="Registro de actividad y cambios en el sistema"
      />

      <FiltrosPanel
        filtros={filtros}
        tieneFiltrosActivos={tieneFiltrosActivos}
        onChange={actualizarFiltro}
        onLimpiar={limpiar}
      />

      <FiltrosAvanzados filtros={filtros} onChange={actualizarFiltro} />

      <AuditoriaTable
        data={data}
        isLoading={isLoading}
        onVerDetalle={setLogSeleccionado}
        onPageChange={setPage}
      />

      <LogDetalleModal
        logId={logSeleccionado}
        onClose={() => setLogSeleccionado(null)}
      />
    </div>
  )
}
