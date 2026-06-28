import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  eventosApi,
  BuscarEventosParams,
  KpisEventos,
} from '../services/eventos.api'
import {
  ChecklistItem,
  ConfirmarEventoPayload,
  RegistrarPagoCuotaPayload,
  SolicitarEventoPayload,
} from '../types'
import { eventosKeys } from '../shared/queryKeys'

export const EVENTOS_KEY = 'eventos'

export function useEventos(params: BuscarEventosParams = {}) {
  return useQuery({
    queryKey: eventosKeys.list(params),
    queryFn: () => eventosApi.buscarAdmin(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useEventosKpis(idSede?: number) {
  return useQuery<KpisEventos>({
    queryKey: ['eventos-kpis', idSede],
    queryFn: () => eventosApi.kpis(idSede),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useEvento(id: number) {
  return useQuery({
    queryKey: eventosKeys.detail(id),
    queryFn: () => eventosApi.obtener(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useChecklist(idEvento: number) {
  return useQuery({
    queryKey: eventosKeys.checklist(idEvento),
    queryFn: () => eventosApi.listarChecklist(idEvento),
    enabled: !!idEvento,
    staleTime: 30_000,
  })
}

export function useExtrasPaquete(idPaquete: number | null) {
  return useQuery({
    queryKey: ['extras-paquete', idPaquete],
    queryFn: () => eventosApi.listarExtrasPaquete(idPaquete!),
    enabled: !!idPaquete,
    staleTime: 1000 * 60 * 10,
  })
}

export function useTurnos(idSede: number | null) {
  return useQuery({
    queryKey: ['turnos', idSede],
    queryFn: () => eventosApi.listarTurnos(idSede!),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 60,
  })
}

export function useServiciosCotizacion() {
  return useQuery({
    queryKey: ['servicios-cotizacion'],
    queryFn: () => eventosApi.listarServiciosCotizacion(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useSolicitarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idCliente,
      idSede,
      payload,
    }: {
      idCliente: number
      idSede: number
      payload: SolicitarEventoPayload
    }) => eventosApi.solicitar(idCliente, idSede, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      toast.success('Evento solicitado correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo solicitar el evento.'),
  })
}

export function useConfirmarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ConfirmarEventoPayload
    }) => eventosApi.confirmar(id, payload),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      qc.setQueryData(eventosKeys.detail(evento.id), evento)
      toast.success('Evento confirmado correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo confirmar el evento.'),
  })
}

export function useCompletarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eventosApi.completar(id),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      qc.setQueryData(eventosKeys.detail(evento.id), evento)
      toast.success('Evento marcado como completado.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo completar el evento.'),
  })
}

export function useRegistrarSaldo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      monto,
      medioPago,
    }: {
      id: number
      monto: number
      medioPago: string
    }) => eventosApi.registrarSaldo(id, monto, medioPago),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      qc.setQueryData(eventosKeys.detail(evento.id), evento)
      toast.success('Pago del saldo registrado.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo registrar el pago.'),
  })
}

export function useCancelarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      eventosApi.cancelar(id, motivo),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      qc.setQueryData(eventosKeys.detail(evento.id), evento)
      toast.success('Evento cancelado.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cancelar el evento.'),
  })
}

export function useCompletarTarea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      idChecklist,
    }: {
      idEvento: number
      idChecklist: number
    }) => eventosApi.completarTarea(idEvento, idChecklist),
    onMutate: async ({ idEvento, idChecklist }) => {
      await qc.cancelQueries({ queryKey: eventosKeys.checklist(idEvento) })
      const prev = qc.getQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento)
      )
      qc.setQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento),
        (old) =>
          old?.map((t) =>
            t.id === idChecklist ? { ...t, completada: true } : t
          ) ?? []
      )
      return { prev }
    },
    onError: (_, { idEvento }, ctx) => {
      qc.setQueryData(eventosKeys.checklist(idEvento), ctx?.prev)
      toast.error('No se pudo completar la tarea.')
    },
    onSuccess: () => toast.success('Tarea completada.'),
    onSettled: (_, __, { idEvento }) => {
      qc.invalidateQueries({ queryKey: eventosKeys.checklist(idEvento) })
    },
  })
}

export function useDescompletarTarea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      idChecklist,
    }: {
      idEvento: number
      idChecklist: number
    }) => eventosApi.descompletarTarea(idEvento, idChecklist),
    onMutate: async ({ idEvento, idChecklist }) => {
      await qc.cancelQueries({ queryKey: eventosKeys.checklist(idEvento) })
      const prev = qc.getQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento)
      )
      qc.setQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento),
        (old) =>
          old?.map((t) =>
            t.id === idChecklist ? { ...t, completada: false } : t
          ) ?? []
      )
      return { prev }
    },
    onError: (_, { idEvento }, ctx) => {
      qc.setQueryData(eventosKeys.checklist(idEvento), ctx?.prev)
      toast.error('No se pudo desmarcar la tarea.')
    },
    onSuccess: () => toast.success('Tarea desmarcada.'),
    onSettled: (_, __, { idEvento }) => {
      qc.invalidateQueries({ queryKey: eventosKeys.checklist(idEvento) })
    },
  })
}

export function useAgregarTarea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ idEvento, tarea }: { idEvento: number; tarea: string }) =>
      eventosApi.agregarTarea(idEvento, tarea),
    onSuccess: (item, { idEvento }) => {
      qc.setQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento),
        (old) => (old ? [...old, item] : [item])
      )
    },
    onError: () => toast.error('No se pudo agregar la tarea.'),
  })
}

export function useEliminarTarea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      idChecklist,
    }: {
      idEvento: number
      idChecklist: number
    }) => eventosApi.eliminarTarea(idEvento, idChecklist),
    onMutate: async ({ idEvento, idChecklist }) => {
      await qc.cancelQueries({ queryKey: eventosKeys.checklist(idEvento) })
      const prev = qc.getQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento)
      )
      qc.setQueryData<ChecklistItem[]>(
        eventosKeys.checklist(idEvento),
        (old) => old?.filter((t) => t.id !== idChecklist) ?? []
      )
      return { prev }
    },
    onError: (_, { idEvento }, ctx) => {
      qc.setQueryData(eventosKeys.checklist(idEvento), ctx?.prev)
      toast.error('No se pudo eliminar la tarea.')
    },
    onSettled: (_, __, { idEvento }) => {
      qc.invalidateQueries({ queryKey: eventosKeys.checklist(idEvento) })
    },
  })
}

export function useRegistrarPagoCuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      idCuota,
      payload,
    }: {
      idEvento: number
      idCuota: number
      payload: RegistrarPagoCuotaPayload
    }) => eventosApi.pagarCuota(idEvento, idCuota, payload),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: eventosKeys.lists() })
      qc.setQueryData(eventosKeys.detail(evento.id), evento)
      toast.success('Cuota registrada correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo registrar el pago de la cuota.'),
  })
}
