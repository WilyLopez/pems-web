import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeApi } from '../services/finance.api'
import {
  AbrirCajaPayload,
  ActualizarEgresoPayload,
  ActualizarGastoOperativoPayload,
  CerrarCajaPayload,
  CrearTipoIngresoPayload,
  CrearTipoEgresoPayload,
  EjecutarPresupuestoPayload,
  GuardarPresupuestoPayload,
  RegistrarArqueoPayload,
  RegistrarEgresoPayload,
  RegistrarGastoEventoPayload,
  RegistrarGastoOperativoPayload,
  RegistrarIngresoManualPayload,
  RegistrarMovimientoManualPayload,
} from '../types'

export const FINANCE_KEYS = {
  ALL: ['finance'] as const,
  TIPOS_EGRESO: () => [...FINANCE_KEYS.ALL, 'tipos-egreso'] as const,
  EGRESOS: () => [...FINANCE_KEYS.ALL, 'egresos'] as const,
  EGRESOS_LIST: (idSede: number | undefined, page: number, size: number) =>
    [...FINANCE_KEYS.EGRESOS(), 'list', idSede, page, size] as const,
  EGRESOS_PERIODO: (
    idSede: number | undefined,
    anio: number | undefined,
    mes: number | undefined
  ) => [...FINANCE_KEYS.EGRESOS(), 'periodo', idSede, anio, mes] as const,
  EGRESOS_RANGO: (
    idSede: number | undefined,
    inicio: string | undefined,
    fin: string | undefined
  ) => [...FINANCE_KEYS.EGRESOS(), 'rango', idSede, inicio, fin] as const,
  GASTOS_EVENTO: (idEvento: number | undefined) =>
    [...FINANCE_KEYS.ALL, 'gastos-evento', idEvento] as const,
  GASTOS_EVENTO_RANGO: (
    idSede: number | undefined,
    inicio: string | undefined,
    fin: string | undefined
  ) =>
    [...FINANCE_KEYS.ALL, 'gastos-evento-rango', idSede, inicio, fin] as const,
  GASTOS_OPERATIVOS: () => [...FINANCE_KEYS.ALL, 'gastos-operativos'] as const,
  GASTOS_OPERATIVOS_LIST: (
    idSede: number | undefined,
    fecha: string | undefined
  ) => [...FINANCE_KEYS.GASTOS_OPERATIVOS(), 'list', idSede, fecha] as const,
  GASTOS_OPERATIVOS_RANGO: (
    idSede: number | undefined,
    inicio: string | undefined,
    fin: string | undefined
  ) =>
    [
      ...FINANCE_KEYS.GASTOS_OPERATIVOS(),
      'rango',
      idSede,
      inicio,
      fin,
    ] as const,
  RESUMEN_MENSUAL: (
    idSede: number | undefined,
    anio: number | undefined,
    mes: number | undefined
  ) => [...FINANCE_KEYS.ALL, 'resumen-mensual', idSede, anio, mes] as const,
  RESUMEN_EVENTO: (idEvento: number | undefined) =>
    [...FINANCE_KEYS.ALL, 'resumen-evento', idEvento] as const,
  RESUMEN_DIARIO: (
    idSede: number | null,
    inicio: string | null,
    fin: string | null
  ) => [...FINANCE_KEYS.ALL, 'resumen-diario', idSede, inicio, fin] as const,
  RESUMEN_RANGO: (
    idSede: number | undefined,
    inicio: string | undefined,
    fin: string | undefined
  ) => [...FINANCE_KEYS.ALL, 'resumen-rango', idSede, inicio, fin] as const,
  METRICAS_RESERVAS: (
    idSede: number | undefined,
    anio: number | undefined,
    mes: number | undefined
  ) => [...FINANCE_KEYS.ALL, 'metricas-reservas', idSede, anio, mes] as const,
  TIPOS_INGRESO: () => [...FINANCE_KEYS.ALL, 'tipos-ingreso'] as const,
  INGRESOS: () => [...FINANCE_KEYS.ALL, 'ingresos'] as const,
  INGRESOS_LIST: (idSede: number | undefined, page: number, size: number) =>
    [...FINANCE_KEYS.INGRESOS(), 'list', idSede, page, size] as const,
  INGRESOS_RANGO: (
    idSede: number | undefined,
    inicio: string | undefined,
    fin: string | undefined
  ) => [...FINANCE_KEYS.INGRESOS(), 'rango', idSede, inicio, fin] as const,
  CAJA: () => [...FINANCE_KEYS.ALL, 'caja'] as const,
  CAJA_DETAIL: (idSede: number | undefined, fecha: string | undefined) =>
    [...FINANCE_KEYS.CAJA(), 'detail', idSede, fecha] as const,
  CAJA_HOY: (idSede: number | undefined) =>
    [...FINANCE_KEYS.CAJA(), 'hoy', idSede] as const,
  MOVIMIENTOS_CAJA: (idApertura: number | undefined) =>
    [...FINANCE_KEYS.CAJA(), 'movimientos', idApertura] as const,
  RESUMEN_CAJA: (idApertura: number | undefined) =>
    [...FINANCE_KEYS.CAJA(), 'resumen', idApertura] as const,
  ARQUEOS_CAJA: (idApertura: number | undefined) =>
    [...FINANCE_KEYS.CAJA(), 'arqueos', idApertura] as const,
  PRESUPUESTOS_EVENTO: (idEvento: number | undefined) =>
    [...FINANCE_KEYS.ALL, 'presupuestos-evento', idEvento] as const,
  DASHBOARD_FINANCIERO: (
    idSede: number | undefined,
    anio: number | undefined,
    mes: number | undefined
  ) =>
    [...FINANCE_KEYS.ALL, 'dashboard-financiero', idSede, anio, mes] as const,
}

export function useTiposEgreso() {
  return useQuery({
    queryKey: FINANCE_KEYS.TIPOS_EGRESO(),
    queryFn: financeApi.listarTiposEgreso,
  })
}

export function useTipoEgresoMutations() {
  const qc = useQueryClient()

  const crear = useMutation({
    mutationFn: financeApi.crearTipoEgreso,
    onSuccess: () => {
      toast.success('Tipo de egreso creado.')
      qc.invalidateQueries({ queryKey: FINANCE_KEYS.TIPOS_EGRESO() })
    },
    onError: () => toast.error('No se pudo crear el tipo de egreso.'),
  })

  const desactivar = useMutation({
    mutationFn: financeApi.desactivarTipoEgreso,
    onSuccess: () => {
      toast.success('Tipo de egreso desactivado.')
      qc.invalidateQueries({ queryKey: FINANCE_KEYS.TIPOS_EGRESO() })
    },
    onError: () => toast.error('No se pudo desactivar el tipo de egreso.'),
  })

  return { crear, desactivar }
}

export function useEgresos(idSede: number | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: FINANCE_KEYS.EGRESOS_LIST(idSede, page, size),
    queryFn: () => financeApi.listarEgresos(idSede!, page, size),
    enabled: !!idSede,
  })
}

export function useEgresosPorPeriodo(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.EGRESOS_PERIODO(idSede, anio, mes),
    queryFn: () => financeApi.listarEgresosPorPeriodo(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
  })
}

export function useEgresosPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.EGRESOS_RANGO(idSede, inicio, fin),
    queryFn: () => financeApi.listarEgresosPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useEgresoMutations() {
  const qc = useQueryClient()

  const invalidarEgresos = () => {
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.EGRESOS() })
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.ALL })
  }

  const registrar = useMutation({
    mutationFn: ({
      idSede,
      payload,
    }: {
      idSede: number
      payload: RegistrarEgresoPayload
    }) => financeApi.registrarEgreso(idSede, payload),
    onSuccess: () => {
      toast.success('Egreso registrado.')
      invalidarEgresos()
    },
    onError: () => toast.error('No se pudo registrar el egreso.'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarEgresoPayload
    }) => financeApi.actualizarEgreso(id, payload),
    onSuccess: () => {
      toast.success('Egreso actualizado.')
      invalidarEgresos()
    },
    onError: () => toast.error('No se pudo actualizar el egreso.'),
  })

  const eliminar = useMutation({
    mutationFn: financeApi.eliminarEgreso,
    onSuccess: () => {
      toast.success('Egreso eliminado.')
      invalidarEgresos()
    },
    onError: () => toast.error('No se pudo eliminar el egreso.'),
  })

  return { registrar, actualizar, eliminar }
}

export function useGastosEventoPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.GASTOS_EVENTO_RANGO(idSede, inicio, fin),
    queryFn: () =>
      financeApi.listarGastosEventoPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useGastosEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.GASTOS_EVENTO(idEvento),
    queryFn: () => financeApi.listarGastosEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function useGastoEventoMutations() {
  const qc = useQueryClient()

  const registrar = useMutation({
    mutationFn: ({
      idEvento,
      payload,
    }: {
      idEvento: number
      payload: RegistrarGastoEventoPayload
    }) => financeApi.registrarGastoEvento(idEvento, payload),
    onSuccess: (_, variables) => {
      toast.success('Gasto registrado.')
      qc.invalidateQueries({
        queryKey: FINANCE_KEYS.GASTOS_EVENTO(variables.idEvento),
      })
      qc.invalidateQueries({
        queryKey: FINANCE_KEYS.RESUMEN_EVENTO(variables.idEvento),
      })
    },
    onError: () => toast.error('No se pudo registrar el gasto.'),
  })

  const eliminar = useMutation({
    mutationFn: ({
      idEvento,
      idGasto,
    }: {
      idEvento: number
      idGasto: number
    }) => financeApi.eliminarGastoEvento(idEvento, idGasto),
    onSuccess: (_, variables) => {
      toast.success('Gasto eliminado.')
      qc.invalidateQueries({
        queryKey: FINANCE_KEYS.GASTOS_EVENTO(variables.idEvento),
      })
      qc.invalidateQueries({
        queryKey: FINANCE_KEYS.RESUMEN_EVENTO(variables.idEvento),
      })
    },
    onError: () => toast.error('No se pudo eliminar el gasto.'),
  })

  return { registrar, eliminar }
}

export function useGastosOperativos(
  idSede: number | undefined,
  fecha: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.GASTOS_OPERATIVOS_LIST(idSede, fecha),
    queryFn: () => financeApi.listarGastosOperativos(idSede!, fecha!),
    enabled: !!idSede && !!fecha,
  })
}

export function useGastosOperativosPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.GASTOS_OPERATIVOS_RANGO(idSede, inicio, fin),
    queryFn: () =>
      financeApi.listarGastosOperativosPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useGastoOperativoMutations() {
  const qc = useQueryClient()

  const invalidarGastos = () => {
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.GASTOS_OPERATIVOS() })
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.ALL })
  }

  const registrar = useMutation({
    mutationFn: ({
      idSede,
      payload,
    }: {
      idSede: number
      payload: RegistrarGastoOperativoPayload
    }) => financeApi.registrarGastoOperativo(idSede, payload),
    onSuccess: () => {
      toast.success('Gasto operativo registrado.')
      invalidarGastos()
    },
    onError: () => toast.error('No se pudo registrar el gasto operativo.'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarGastoOperativoPayload
    }) => financeApi.actualizarGastoOperativo(id, payload),
    onSuccess: () => {
      toast.success('Gasto operativo actualizado.')
      invalidarGastos()
    },
    onError: () => toast.error('No se pudo actualizar el gasto operativo.'),
  })

  const eliminar = useMutation({
    mutationFn: financeApi.eliminarGastoOperativo,
    onSuccess: () => {
      toast.success('Gasto operativo eliminado.')
      invalidarGastos()
    },
    onError: () => toast.error('No se pudo eliminar el gasto operativo.'),
  })

  return { registrar, actualizar, eliminar }
}

export function useResumenMensual(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.RESUMEN_MENSUAL(idSede, anio, mes),
    queryFn: ({ signal }) =>
      financeApi.resumenMensual(idSede!, anio!, mes!, signal),
    enabled: !!idSede && !!anio && !!mes,
    staleTime: 1000 * 60 * 5,
  })
}

export function useResumenEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.RESUMEN_EVENTO(idEvento),
    queryFn: () => financeApi.resumenEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function useResumenDiario(
  idSede: number | null,
  inicio: string | null,
  fin: string | null
) {
  return useQuery({
    queryKey: FINANCE_KEYS.RESUMEN_DIARIO(idSede, inicio, fin),
    queryFn: ({ signal }) =>
      financeApi.resumenDiario(idSede!, inicio!, fin!, signal),
    enabled: !!idSede && !!inicio && !!fin,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useResumenRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.RESUMEN_RANGO(idSede, inicio, fin),
    queryFn: () => financeApi.resumenPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useMetricasReservas(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.METRICAS_RESERVAS(idSede, anio, mes),
    queryFn: () => financeApi.metricasReservas(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
  })
}

export function useTiposIngreso() {
  return useQuery({
    queryKey: FINANCE_KEYS.TIPOS_INGRESO(),
    queryFn: financeApi.listarTiposIngreso,
  })
}

export function useTipoIngresoMutations() {
  const qc = useQueryClient()

  const crear = useMutation({
    mutationFn: (payload: CrearTipoIngresoPayload) =>
      financeApi.crearTipoIngreso(payload),
    onSuccess: () => {
      toast.success('Tipo de ingreso creado.')
      qc.invalidateQueries({ queryKey: FINANCE_KEYS.TIPOS_INGRESO() })
    },
    onError: () => toast.error('No se pudo crear el tipo de ingreso.'),
  })

  const desactivar = useMutation({
    mutationFn: (codigo: string) => financeApi.desactivarTipoIngreso(codigo),
    onSuccess: () => {
      toast.success('Tipo de ingreso desactivado.')
      qc.invalidateQueries({ queryKey: FINANCE_KEYS.TIPOS_INGRESO() })
    },
    onError: () => toast.error('No se pudo desactivar el tipo de ingreso.'),
  })

  return { crear, desactivar }
}

export function useIngresos(idSede: number | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: FINANCE_KEYS.INGRESOS_LIST(idSede, page, size),
    queryFn: () => financeApi.listarIngresos(idSede!, page, size),
    enabled: !!idSede,
  })
}

export function useIngresosPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.INGRESOS_RANGO(idSede, inicio, fin),
    queryFn: () => financeApi.listarIngresosPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useIngresoMutations() {
  const qc = useQueryClient()

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.INGRESOS() })
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.ALL })
  }

  const registrar = useMutation({
    mutationFn: ({
      idSede,
      payload,
    }: {
      idSede: number
      payload: RegistrarIngresoManualPayload
    }) => financeApi.registrarIngresoManual(idSede, payload),
    onSuccess: () => {
      toast.success('Ingreso registrado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo registrar el ingreso.'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => financeApi.eliminarIngreso(id),
    onSuccess: () => {
      toast.success('Ingreso eliminado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo eliminar el ingreso.'),
  })

  return { registrar, eliminar }
}

export function useCaja(idSede: number | undefined, fecha: string | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.CAJA_DETAIL(idSede, fecha),
    queryFn: () => financeApi.obtenerCaja(idSede!, fecha!),
    enabled: !!idSede && !!fecha,
  })
}

export function useCajaHoy(idSede: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.CAJA_HOY(idSede),
    queryFn: () => financeApi.obtenerCajaHoy(idSede!),
    enabled: !!idSede,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}

export function useArqueosCaja(idApertura: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.ARQUEOS_CAJA(idApertura),
    queryFn: () => financeApi.listarArqueosCaja(idApertura!),
    enabled: !!idApertura,
  })
}

export function useArqueoMutations() {
  const qc = useQueryClient()

  const registrar = useMutation({
    mutationFn: ({
      idApertura,
      payload,
    }: {
      idApertura: number
      payload: RegistrarArqueoPayload
    }) => financeApi.registrarArqueo(idApertura, payload),
    onSuccess: (_, variables) => {
      toast.success('Arqueo registrado.')
      qc.invalidateQueries({
        queryKey: FINANCE_KEYS.ARQUEOS_CAJA(variables.idApertura),
      })
      qc.invalidateQueries({ queryKey: FINANCE_KEYS.CAJA() })
    },
    onError: () => toast.error('No se pudo registrar el arqueo.'),
  })

  return { registrar }
}

export function useCajaMutations() {
  const qc = useQueryClient()

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.CAJA() })
    qc.invalidateQueries({ queryKey: FINANCE_KEYS.ALL })
  }

  const abrir = useMutation({
    mutationFn: ({
      idSede,
      payload,
    }: {
      idSede: number
      payload: AbrirCajaPayload
    }) => financeApi.abrirCaja(idSede, payload),
    onSuccess: () => {
      toast.success('Caja abierta.')
      invalidar()
    },
    onError: () => toast.error('No se pudo abrir la caja.'),
  })

  const cerrar = useMutation({
    mutationFn: ({
      idApertura,
      payload,
    }: {
      idApertura: number
      payload: CerrarCajaPayload
    }) => financeApi.cerrarCaja(idApertura, payload),
    onSuccess: () => {
      toast.success('Caja cerrada.')
      invalidar()
    },
    onError: () => toast.error('No se pudo cerrar la caja.'),
  })

  const registrarMovimiento = useMutation({
    mutationFn: ({
      idApertura,
      payload,
    }: {
      idApertura: number
      payload: RegistrarMovimientoManualPayload
    }) => financeApi.registrarMovimientoManual(idApertura, payload),
    onSuccess: () => {
      toast.success('Movimiento registrado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo registrar el movimiento.'),
  })

  return { abrir, cerrar, registrarMovimiento }
}

export function useMovimientosCaja(idApertura: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.MOVIMIENTOS_CAJA(idApertura),
    queryFn: () => financeApi.listarMovimientosCaja(idApertura!),
    enabled: !!idApertura,
  })
}

export function usePresupuestosEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: FINANCE_KEYS.PRESUPUESTOS_EVENTO(idEvento),
    queryFn: () => financeApi.listarPresupuestosEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function usePresupuestoMutations() {
  const qc = useQueryClient()

  const invalidar = () =>
    qc.invalidateQueries({
      queryKey: FINANCE_KEYS.PRESUPUESTOS_EVENTO(undefined),
    })

  const guardar = useMutation({
    mutationFn: ({
      idEvento,
      payload,
    }: {
      idEvento: number
      payload: GuardarPresupuestoPayload
    }) => financeApi.guardarPresupuesto(idEvento, payload),
    onSuccess: () => {
      toast.success('Presupuesto guardado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo guardar el presupuesto.'),
  })

  const ejecutar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: EjecutarPresupuestoPayload
    }) => financeApi.ejecutarPresupuesto(id, payload),
    onSuccess: () => {
      toast.success('Presupuesto ejecutado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo ejecutar el presupuesto.'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => financeApi.eliminarPresupuesto(id),
    onSuccess: () => {
      toast.success('Presupuesto eliminado.')
      invalidar()
    },
    onError: () => toast.error('No se pudo eliminar el presupuesto.'),
  })

  return { guardar, ejecutar, eliminar }
}

export function useDashboardFinanciero(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: FINANCE_KEYS.DASHBOARD_FINANCIERO(idSede, anio, mes),
    queryFn: ({ signal }) =>
      financeApi.dashboardFinanciero(idSede!, anio!, mes!, signal),
    enabled: !!idSede && !!anio && !!mes,
    staleTime: 1000 * 60 * 5,
  })
}
