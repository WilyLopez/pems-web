'use client'

import { useMemo, useState } from 'react'
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useDisponibilidadRango } from '../../../hooks/useCalendarData'
import { Disponibilidad } from '../../../types'
import { useGaleriaPublica } from '@/features/public/shared/hooks/useGaleriaPublica'
import { usePublicPrecios } from '@/features/public/shared/hooks/usePublicPrecios'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { formatHora12h } from '@/lib/horario'

export const DIRECCION_LOCAL = 'Av. Antenor Orrego 363, La Victoria'

export interface DiaBanner {
  fecha: string
  etiqueta: string
  etiquetaCompleta: string
  numero: string
  estado: string
  tono: 'normal' | 'alerta'
}

function capitalizar(valor: string): string {
  return valor.charAt(0).toUpperCase() + valor.slice(1)
}

function estadoDia(disp: Disponibilidad | undefined): {
  estado: string
  tono: 'normal' | 'alerta'
} {
  if (!disp) return { estado: 'Atención Normal', tono: 'normal' }
  if (disp.bloqueadoManualmente) return { estado: 'Cerrado', tono: 'alerta' }
  if (disp.esFeriado && !disp.accesoPublicoActivo)
    return { estado: 'Feriado', tono: 'alerta' }
  if (!disp.accesoPublicoActivo || disp.tipoOcupacion === 'PRIVADO_LLENO')
    return { estado: 'Solo evento privado', tono: 'alerta' }
  return { estado: 'Atención Normal', tono: 'normal' }
}

function hashCadena(valor: string): number {
  let hash = 0
  for (let i = 0; i < valor.length; i++) {
    hash = (hash * 31 + valor.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function formatDuracion(minutos?: number | null): string {
  if (!minutos) return 'Tiempo ilimitado'
  if (minutos % 60 === 0)
    return `${minutos / 60} hora${minutos === 60 ? '' : 's'}`
  return `${minutos} minutos`
}

export function useBannerSemanalData(idSede: number) {
  const [semanaBase, setSemanaBase] = useState(() => new Date())
  const inicioSemana = useMemo(
    () => startOfWeek(semanaBase, { weekStartsOn: 1 }),
    [semanaBase]
  )
  const finSemana = useMemo(
    () => endOfWeek(semanaBase, { weekStartsOn: 1 }),
    [semanaBase]
  )
  const inicio = format(inicioSemana, 'yyyy-MM-dd')
  const fin = format(finSemana, 'yyyy-MM-dd')

  const { data: disponibilidad, isLoading: cargandoDisponibilidad } =
    useDisponibilidadRango(idSede, inicio, fin)
  const { data: imagenes, isLoading: cargandoGaleria } = useGaleriaPublica(
    false,
    12
  )
  const { data: precios } = usePublicPrecios(idSede)
  const { data: config } = usePublicConfig()
  const { data: configCalendario } = useConfiguracionCalendarioPublica(idSede)

  const dias: DiaBanner[] = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const fecha = addDays(inicioSemana, i)
        const fStr = format(fecha, 'yyyy-MM-dd')
        const disp = disponibilidad?.find((d) => d.fecha === fStr)
        const { estado, tono } = estadoDia(disp)
        const nombreDia = capitalizar(format(fecha, 'EEEE', { locale: es }))
        return {
          fecha: fStr,
          etiqueta: nombreDia,
          etiquetaCompleta: `${nombreDia} ${format(fecha, 'dd')}`,
          numero: format(fecha, 'd'),
          estado,
          tono,
        }
      }),
    [inicioSemana, disponibilidad]
  )

  const fotoUrl = useMemo(() => {
    if (!imagenes || imagenes.length === 0) return null
    return imagenes[hashCadena(inicio) % imagenes.length].url
  }, [imagenes, inicio])

  const tarifaSemana = precios?.find((p) => p.tipoDia === 'SEMANA')
  const tarifaFinSemana = precios?.find(
    (p) => p.tipoDia === 'FIN_SEMANA_FERIADO'
  )

  const horario = configCalendario
    ? `${formatHora12h(configCalendario.horaApertura)} a ${formatHora12h(configCalendario.horaCierre)}`
    : '10:00 am a 8:00 pm'

  return {
    inicioSemana,
    finSemana,
    rangoTexto: `Del ${format(inicioSemana, 'dd')} al ${format(finSemana, 'dd')} de ${format(finSemana, 'MMMM', { locale: es })}`,
    irSemanaAnterior: () => setSemanaBase((prev) => subWeeks(prev, 1)),
    irSemanaSiguiente: () => setSemanaBase((prev) => addWeeks(prev, 1)),
    dias,
    fotoUrl,
    precioSemana: tarifaSemana ? Number(tarifaSemana.precio) : null,
    precioFinSemana: tarifaFinSemana ? Number(tarifaFinSemana.precio) : null,
    duracionSemana: formatDuracion(tarifaSemana?.duracionMinutos),
    duracionFinSemana: formatDuracion(tarifaFinSemana?.duracionMinutos),
    horario,
    whatsapp: config?.whatsapp,
    logoUrl: config?.logoUrl || '/logo-principal.png',
    nombreNegocio: config?.nombreNegocio ?? 'Kiki y Lala',
    direccion: DIRECCION_LOCAL,
    cargando: cargandoDisponibilidad || cargandoGaleria,
  }
}

export type BannerSemanalData = ReturnType<typeof useBannerSemanalData>
