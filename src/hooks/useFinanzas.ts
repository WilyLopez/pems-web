import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { finanzasService } from '@/services/finanzas.service'
import {
  AbrirCajaPayload,
  ActualizarEgresoPayload,
  ActualizarGastoOperativoPayload,
  CerrarCajaPayload,
  CrearTipoIngresoPayload,
  EjecutarPresupuestoPayload,
  GuardarPresupuestoPayload,
  RegistrarEgresoPayload,
  RegistrarGastoEventoPayload,
  RegistrarGastoOperativoPayload,
  RegistrarIngresoManualPayload,
  RegistrarMovimientoManualPayload,
} from '@/types/finanzas.types'

export function useTiposEgreso() {
  return useQuery({
    queryKey: ['tipos-egreso'],
    queryFn: finanzasService.listarTiposEgreso,
  })
}

export function useTipoEgresoMutations() {
  const qc = useQueryClient()

  const crear = useMutation({
    mutationFn: finanzasService.crearTipoEgreso,
    onSuccess: () => {
      toast.success('Tipo de egreso creado.')
      qc.invalidateQueries({ queryKey: ['tipos-egreso'] })
    },
    onError: () => toast.error('No se pudo crear el tipo de egreso.'),
  })

  const desactivar = useMutation({
    mutationFn: finanzasService.desactivarTipoEgreso,
    onSuccess: () => {
      toast.success('Tipo de egreso desactivado.')
      qc.invalidateQueries({ queryKey: ['tipos-egreso'] })
    },
    onError: () => toast.error('No se pudo desactivar el tipo de egreso.'),
  })

  return { crear, desactivar }
}

export function useEgresos(idSede: number | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ['egresos', idSede, page, size],
    queryFn: () => finanzasService.listarEgresos(idSede!, page, size),
    enabled: !!idSede,
  })
}

export function useEgresosPorPeriodo(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: ['egresos-periodo', idSede, anio, mes],
    queryFn: () => finanzasService.listarEgresosPorPeriodo(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
  })
}

export function useEgresosPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: ['egresos-rango', idSede, inicio, fin],
    queryFn: () => finanzasService.listarEgresosPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useEgresoMutations() {
  const qc = useQueryClient()

  const invalidarEgresos = () => {
    qc.invalidateQueries({ queryKey: ['egresos'] })
    qc.invalidateQueries({ queryKey: ['egresos-periodo'] })
    qc.invalidateQueries({ queryKey: ['egresos-rango'] })
    qc.invalidateQueries({ queryKey: ['resumen-financiero'] })
  }

  const registrar = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: RegistrarEgresoPayload }) =>
      finanzasService.registrarEgreso(idSede, payload),
    onSuccess: () => { toast.success('Egreso registrado.'); invalidarEgresos() },
    onError: () => toast.error('No se pudo registrar el egreso.'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarEgresoPayload }) =>
      finanzasService.actualizarEgreso(id, payload),
    onSuccess: () => { toast.success('Egreso actualizado.'); invalidarEgresos() },
    onError: () => toast.error('No se pudo actualizar el egreso.'),
  })

  const eliminar = useMutation({
    mutationFn: finanzasService.eliminarEgreso,
    onSuccess: () => { toast.success('Egreso eliminado.'); invalidarEgresos() },
    onError: () => toast.error('No se pudo eliminar el egreso.'),
  })

  return { registrar, actualizar, eliminar }
}

export function useGastosEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: ['gastos-evento', idEvento],
    queryFn: () => finanzasService.listarGastosEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function useGastoEventoMutations() {
  const qc = useQueryClient()

  const registrar = useMutation({
    mutationFn: ({ idEvento, payload }: { idEvento: number; payload: RegistrarGastoEventoPayload }) =>
      finanzasService.registrarGastoEvento(idEvento, payload),
    onSuccess: () => {
      toast.success('Gasto registrado.')
      qc.invalidateQueries({ queryKey: ['gastos-evento'] })
    },
    onError: () => toast.error('No se pudo registrar el gasto.'),
  })

  const eliminar = useMutation({
    mutationFn: ({ idEvento, idGasto }: { idEvento: number; idGasto: number }) =>
      finanzasService.eliminarGastoEvento(idEvento, idGasto),
    onSuccess: () => {
      toast.success('Gasto eliminado.')
      qc.invalidateQueries({ queryKey: ['gastos-evento'] })
    },
    onError: () => toast.error('No se pudo eliminar el gasto.'),
  })

  return { registrar, eliminar }
}

export function useGastosOperativos(idSede: number | undefined, fecha: string | undefined) {
  return useQuery({
    queryKey: ['gastos-operativos', idSede, fecha],
    queryFn: () => finanzasService.listarGastosOperativos(idSede!, fecha!),
    enabled: !!idSede && !!fecha,
  })
}

export function useGastosOperativosPorRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: ['gastos-operativos-rango', idSede, inicio, fin],
    queryFn: () => finanzasService.listarGastosOperativosPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useGastoOperativoMutations() {
  const qc = useQueryClient()

  const invalidarGastos = () => {
    qc.invalidateQueries({ queryKey: ['gastos-operativos'] })
    qc.invalidateQueries({ queryKey: ['gastos-operativos-rango'] })
    qc.invalidateQueries({ queryKey: ['resumen-financiero'] })
    qc.invalidateQueries({ queryKey: ['resumen-diario'] })
  }

  const registrar = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: RegistrarGastoOperativoPayload }) =>
      finanzasService.registrarGastoOperativo(idSede, payload),
    onSuccess: () => { toast.success('Gasto operativo registrado.'); invalidarGastos() },
    onError: () => toast.error('No se pudo registrar el gasto operativo.'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarGastoOperativoPayload }) =>
      finanzasService.actualizarGastoOperativo(id, payload),
    onSuccess: () => { toast.success('Gasto operativo actualizado.'); invalidarGastos() },
    onError: () => toast.error('No se pudo actualizar el gasto operativo.'),
  })

  const eliminar = useMutation({
    mutationFn: finanzasService.eliminarGastoOperativo,
    onSuccess: () => { toast.success('Gasto operativo eliminado.'); invalidarGastos() },
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
    queryKey: ['resumen-financiero', idSede, anio, mes],
    queryFn: () => finanzasService.resumenMensual(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
    staleTime: 1000 * 60 * 5,
  })
}

export function useResumenEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: ['resumen-evento-financiero', idEvento],
    queryFn: () => finanzasService.resumenEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function useResumenDiario(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: ['resumen-diario', idSede, inicio, fin],
    queryFn: () => finanzasService.resumenDiario(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useResumenRango(
  idSede: number | undefined,
  inicio: string | undefined,
  fin: string | undefined
) {
  return useQuery({
    queryKey: ['resumen-rango', idSede, inicio, fin],
    queryFn: () => finanzasService.resumenPorRango(idSede!, inicio!, fin!),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useMetricasReservas(
  idSede: number | undefined,
  anio: number | undefined,
  mes: number | undefined
) {
  return useQuery({
    queryKey: ['metricas-reservas', idSede, anio, mes],
    queryFn: () => finanzasService.metricasReservas(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
  })
}

export function useTiposIngreso() {
  return useQuery({
    queryKey: ['tipos-ingreso'],
    queryFn: finanzasService.listarTiposIngreso,
  })
}

export function useTipoIngresoMutations() {
  const qc = useQueryClient()

  const crear = useMutation({
    mutationFn: (payload: CrearTipoIngresoPayload) => finanzasService.crearTipoIngreso(payload),
    onSuccess: () => {
      toast.success('Tipo de ingreso creado.')
      qc.invalidateQueries({ queryKey: ['tipos-ingreso'] })
    },
    onError: () => toast.error('No se pudo crear el tipo de ingreso.'),
  })

  const desactivar = useMutation({
    mutationFn: (id: number) => finanzasService.desactivarTipoIngreso(id),
    onSuccess: () => {
      toast.success('Tipo de ingreso desactivado.')
      qc.invalidateQueries({ queryKey: ['tipos-ingreso'] })
    },
    onError: () => toast.error('No se pudo desactivar el tipo de ingreso.'),
  })

  return { crear, desactivar }
}

export function useIngresos(idSede: number | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ['ingresos', idSede, page, size],
    queryFn: () => finanzasService.listarIngresos(idSede!, page, size),
    enabled: !!idSede,
  })
}

export function useIngresoMutations() {
  const qc = useQueryClient()

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ingresos'] })
    qc.invalidateQueries({ queryKey: ['dashboard-financiero'] })
  }

  const registrar = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: RegistrarIngresoManualPayload }) =>
      finanzasService.registrarIngresoManual(idSede, payload),
    onSuccess: () => { toast.success('Ingreso registrado.'); invalidar() },
    onError: () => toast.error('No se pudo registrar el ingreso.'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => finanzasService.eliminarIngreso(id),
    onSuccess: () => { toast.success('Ingreso eliminado.'); invalidar() },
    onError: () => toast.error('No se pudo eliminar el ingreso.'),
  })

  return { registrar, eliminar }
}

export function useCaja(idSede: number | undefined, fecha: string | undefined) {
  return useQuery({
    queryKey: ['caja', idSede, fecha],
    queryFn: () => finanzasService.obtenerCaja(idSede!, fecha!),
    enabled: !!idSede && !!fecha,
  })
}

export function useCajaMutations() {
  const qc = useQueryClient()

  const invalidar = () => qc.invalidateQueries({ queryKey: ['caja'] })

  const abrir = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: AbrirCajaPayload }) =>
      finanzasService.abrirCaja(idSede, payload),
    onSuccess: () => { toast.success('Caja abierta.'); invalidar() },
    onError: () => toast.error('No se pudo abrir la caja.'),
  })

  const cerrar = useMutation({
    mutationFn: ({ idApertura, payload }: { idApertura: number; payload: CerrarCajaPayload }) =>
      finanzasService.cerrarCaja(idApertura, payload),
    onSuccess: () => { toast.success('Caja cerrada.'); invalidar() },
    onError: () => toast.error('No se pudo cerrar la caja.'),
  })

  const registrarMovimiento = useMutation({
    mutationFn: ({ idApertura, payload }: { idApertura: number; payload: RegistrarMovimientoManualPayload }) =>
      finanzasService.registrarMovimientoManual(idApertura, payload),
    onSuccess: () => { toast.success('Movimiento registrado.'); invalidar() },
    onError: () => toast.error('No se pudo registrar el movimiento.'),
  })

  return { abrir, cerrar, registrarMovimiento }
}

export function useMovimientosCaja(idApertura: number | undefined) {
  return useQuery({
    queryKey: ['movimientos-caja', idApertura],
    queryFn: () => finanzasService.listarMovimientosCaja(idApertura!),
    enabled: !!idApertura,
  })
}

export function usePresupuestosEvento(idEvento: number | undefined) {
  return useQuery({
    queryKey: ['presupuestos-evento', idEvento],
    queryFn: () => finanzasService.listarPresupuestosEvento(idEvento!),
    enabled: !!idEvento,
  })
}

export function usePresupuestoMutations() {
  const qc = useQueryClient()

  const invalidar = () => qc.invalidateQueries({ queryKey: ['presupuestos-evento'] })

  const guardar = useMutation({
    mutationFn: ({ idEvento, payload }: { idEvento: number; payload: GuardarPresupuestoPayload }) =>
      finanzasService.guardarPresupuesto(idEvento, payload),
    onSuccess: () => { toast.success('Presupuesto guardado.'); invalidar() },
    onError: () => toast.error('No se pudo guardar el presupuesto.'),
  })

  const ejecutar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EjecutarPresupuestoPayload }) =>
      finanzasService.ejecutarPresupuesto(id, payload),
    onSuccess: () => { toast.success('Presupuesto ejecutado.'); invalidar() },
    onError: () => toast.error('No se pudo ejecutar el presupuesto.'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => finanzasService.eliminarPresupuesto(id),
    onSuccess: () => { toast.success('Presupuesto eliminado.'); invalidar() },
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
    queryKey: ['dashboard-financiero', idSede, anio, mes],
    queryFn: () => finanzasService.dashboardFinanciero(idSede!, anio!, mes!),
    enabled: !!idSede && !!anio && !!mes,
    staleTime: 1000 * 60 * 5,
  })
}
