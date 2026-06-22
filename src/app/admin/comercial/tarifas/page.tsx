'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useTarifasActivas, useConfigurarTarifa } from '@/features/admin/comercial/tarifas/hooks/useTarifas'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { TarifaCard } from '@/features/admin/comercial/tarifas/components/TarifaCard'
import { VistaPrevia } from '@/features/admin/comercial/tarifas/components/VistaPrevia'

export default function TarifasPage() {
  const { idSede } = useAuth()
  const { data: tarifas, isLoading } = useTarifasActivas(idSede)
  const configurar = useConfigurarTarifa(idSede)

  const tarifaSemana = tarifas?.find((t) => t.tipoDia === 'SEMANA')
  const tarifaFds = tarifas?.find((t) => t.tipoDia === 'FIN_SEMANA_FERIADO')

  const [precioSemanaLocal, setPrecioSemanaLocal] = useState<number | null>(null)
  const [precioFdsLocal, setPrecioFdsLocal] = useState<number | null>(null)

  useEffect(() => {
    if (tarifaSemana) setPrecioSemanaLocal(Number(tarifaSemana.precio))
  }, [tarifaSemana])

  useEffect(() => {
    if (tarifaFds) setPrecioFdsLocal(Number(tarifaFds.precio))
  }, [tarifaFds])

  const hoy = format(new Date(), 'yyyy-MM-dd')

  const handleGuardar = (tipoDiaCodigo: string, precio: number) => {
    configurar.mutate({ tipoDia: tipoDiaCodigo, precio, vigenciaDesde: hoy })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurar Tarifas"
        description="Establece los precios de entrada a la zona de juegos para la sede actual."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TarifaCard
              titulo="Entre semana"
              subtitulo="Lunes a Viernes"
              precioActual={tarifaSemana ? Number(tarifaSemana.precio) : undefined}
              onPrecioChange={setPrecioSemanaLocal}
              onGuardar={(precio) => handleGuardar('SEMANA', precio)}
              isLoading={configurar.isPending}
            />
            <TarifaCard
              titulo="Fines de semana y feriados"
              subtitulo="Sábados, Domingos y Feriados"
              precioActual={tarifaFds ? Number(tarifaFds.precio) : undefined}
              onPrecioChange={setPrecioFdsLocal}
              onGuardar={(precio) => handleGuardar('FIN_SEMANA_FERIADO', precio)}
              isLoading={configurar.isPending}
            />
          </div>
          <VistaPrevia
            precioSemana={precioSemanaLocal}
            precioFinDeSemana={precioFdsLocal}
          />
        </div>
      )}
    </div>
  )
}
