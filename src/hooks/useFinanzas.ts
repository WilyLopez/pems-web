import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { finanzasService } from '@/services/finanzas.service'
import { CategoriaEgreso, RegistrarEgresoPayload, RegistrarGastoEventoPayload, RegistrarGastoOperativoPayload } from '@/types/finanzas.types'

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

export function useEgresoMutations() {
  const qc = useQueryClient()

  const registrar = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: RegistrarEgresoPayload }) =>
      finanzasService.registrarEgreso(idSede, payload),
    onSuccess: () => {
      toast.success('Egreso registrado.')
      qc.invalidateQueries({ queryKey: ['egresos'] })
      qc.invalidateQueries({ queryKey: ['egresos-periodo'] })
      qc.invalidateQueries({ queryKey: ['resumen-financiero'] })
    },
    onError: () => toast.error('No se pudo registrar el egreso.'),
  })

  const eliminar = useMutation({
    mutationFn: finanzasService.eliminarEgreso,
    onSuccess: () => {
      toast.success('Egreso eliminado.')
      qc.invalidateQueries({ queryKey: ['egresos'] })
      qc.invalidateQueries({ queryKey: ['egresos-periodo'] })
      qc.invalidateQueries({ queryKey: ['resumen-financiero'] })
    },
    onError: () => toast.error('No se pudo eliminar el egreso.'),
  })

  return { registrar, eliminar }
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

export function useGastoOperativoMutations() {
  const qc = useQueryClient()

  const registrar = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: RegistrarGastoOperativoPayload }) =>
      finanzasService.registrarGastoOperativo(idSede, payload),
    onSuccess: () => {
      toast.success('Gasto operativo registrado.')
      qc.invalidateQueries({ queryKey: ['gastos-operativos'] })
    },
    onError: () => toast.error('No se pudo registrar el gasto operativo.'),
  })

  const eliminar = useMutation({
    mutationFn: finanzasService.eliminarGastoOperativo,
    onSuccess: () => {
      toast.success('Gasto operativo eliminado.')
      qc.invalidateQueries({ queryKey: ['gastos-operativos'] })
    },
    onError: () => toast.error('No se pudo eliminar el gasto operativo.'),
  })

  return { registrar, eliminar }
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
