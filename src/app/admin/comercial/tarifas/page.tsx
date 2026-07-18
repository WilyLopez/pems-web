'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import {
  useTarifasActivas,
  useConfigurarTarifa,
} from '@/features/admin/comercial/tarifas/hooks/useTarifas'
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

  const [precioSemanaLocal, setPrecioSemanaLocal] = useState<number | null>(
    null
  )
  const [precioFdsLocal, setPrecioFdsLocal] = useState<number | null>(null)
  const [duracionSemanaLocal, setDuracionSemanaLocal] = useState<
    number | undefined
  >(undefined)
  const [duracionFdsLocal, setDuracionFdsLocal] = useState<number | undefined>(
    undefined
  )

  useEffect(() => {
    if (tarifaSemana) {
      setPrecioSemanaLocal(Number(tarifaSemana.precio))
      setDuracionSemanaLocal(tarifaSemana.duracionMinutos ?? undefined)
    }
  }, [tarifaSemana])

  useEffect(() => {
    if (tarifaFds) {
      setPrecioFdsLocal(Number(tarifaFds.precio))
      setDuracionFdsLocal(tarifaFds.duracionMinutos ?? undefined)
    }
  }, [tarifaFds])

  const hoy = format(new Date(), 'yyyy-MM-dd')

  const handleGuardar = (
    tipoDiaCodigo: string,
    precio: number,
    duracionMinutos?: number
  ) => {
    configurar.mutate({
      tipoDia: tipoDiaCodigo,
      precio,
      duracionMinutos,
      vigenciaDesde: hoy,
    })
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
              precioActual={
                tarifaSemana ? Number(tarifaSemana.precio) : undefined
              }
              duracionActual={tarifaSemana?.duracionMinutos ?? undefined}
              onPrecioChange={setPrecioSemanaLocal}
              onDuracionChange={setDuracionSemanaLocal}
              onGuardar={(precio, duracionMinutos) =>
                handleGuardar('SEMANA', precio, duracionMinutos)
              }
              isLoading={configurar.isPending}
            />
            <TarifaCard
              titulo="Fines de semana y feriados"
              subtitulo="Sábados, Domingos y Feriados"
              precioActual={tarifaFds ? Number(tarifaFds.precio) : undefined}
              duracionActual={tarifaFds?.duracionMinutos ?? undefined}
              onPrecioChange={setPrecioFdsLocal}
              onDuracionChange={setDuracionFdsLocal}
              onGuardar={(precio, duracionMinutos) =>
                handleGuardar('FIN_SEMANA_FERIADO', precio, duracionMinutos)
              }
              isLoading={configurar.isPending}
            />
          </div>
          <VistaPrevia
            precioSemana={precioSemanaLocal}
            precioFinDeSemana={precioFdsLocal}
            duracionSemana={duracionSemanaLocal}
            duracionFinDeSemana={duracionFdsLocal}
          />
        </div>
      )}
    </div>
  )
}
