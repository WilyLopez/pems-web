'use client'

import { useCallback, useState } from 'react'
import { AuditoriaFiltros } from '../types'

function defaultFiltros(): AuditoriaFiltros {
  const hoy = new Date()
  const hace7 = new Date()
  hace7.setDate(hoy.getDate() - 7)
  return {
    desde: hace7.toISOString().split('T')[0],
    hasta: hoy.toISOString().split('T')[0],
    tamano: 20,
  }
}

export function useAuditoriaFiltros() {
  const [filtros, setFiltros] = useState<AuditoriaFiltros>(defaultFiltros)
  const [page, setPage] = useState(0)

  const actualizarFiltro = useCallback(
    <K extends keyof AuditoriaFiltros>(key: K, value: AuditoriaFiltros[K]) => {
      setFiltros((prev) => ({ ...prev, [key]: value }))
      setPage(0)
    },
    []
  )

  const limpiar = useCallback(() => {
    setFiltros((prev) => ({
      desde: prev.desde,
      hasta: prev.hasta,
      tamano: prev.tamano,
    }))
    setPage(0)
  }, [])

  const tieneFiltrosActivos = !!(
    filtros.modulo ||
    filtros.accion ||
    filtros.nivel ||
    filtros.resultado ||
    filtros.entidad ||
    filtros.idUsuario
  )

  return { filtros, page, setPage, actualizarFiltro, limpiar, tieneFiltrosActivos }
}
