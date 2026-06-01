import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { eventoService, BuscarEventosParams } from '@/services/evento.service'
import { ConfirmarEventoPayload } from '@/types/evento.types'

export const EVENTOS_KEY = 'eventos'
export const EVENTO_KEY = 'evento'
export const CHECKLIST_KEY = 'checklist'

export function useEventos(params: BuscarEventosParams = {}) {
  return useQuery({
    queryKey: [EVENTOS_KEY, params],
    queryFn: () => eventoService.buscarAdmin(params),
  })
}

export function useEvento(id: number) {
  return useQuery({
    queryKey: [EVENTO_KEY, id],
    queryFn: () => eventoService.obtener(id),
    enabled: !!id,
  })
}

export function useChecklist(idEvento: number) {
  return useQuery({
    queryKey: [CHECKLIST_KEY, idEvento],
    queryFn: () => eventoService.listarChecklist(idEvento),
    enabled: !!idEvento,
  })
}

export function useExtrasPaquete(idPaquete: number | null) {
  return useQuery({
    queryKey: ['extras-paquete', idPaquete],
    queryFn: () => eventoService.listarExtrasPaquete(idPaquete!),
    enabled: !!idPaquete,
    staleTime: 1000 * 60 * 10,
  })
}

export function useTurnos(idSede: number | null) {
  return useQuery({
    queryKey: ['turnos', idSede],
    queryFn: () => eventoService.listarTurnos(idSede!),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 60,
  })
}

export function useServiciosCotizacion() {
  return useQuery({
    queryKey: ['servicios-cotizacion'],
    queryFn: () => eventoService.listarServiciosCotizacion(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useConfirmarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ConfirmarEventoPayload }) =>
      eventoService.confirmar(id, payload),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      qc.setQueryData([EVENTO_KEY, evento.id], evento)
      toast.success('Evento confirmado correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo confirmar el evento.'),
  })
}

export function useCompletarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eventoService.completar(id),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      qc.setQueryData([EVENTO_KEY, evento.id], evento)
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
    }) => eventoService.registrarSaldo(id, monto, medioPago),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      qc.setQueryData([EVENTO_KEY, evento.id], evento)
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
      eventoService.cancelar(id, motivo),
    onSuccess: (evento) => {
      qc.invalidateQueries({ queryKey: [EVENTOS_KEY] })
      qc.setQueryData([EVENTO_KEY, evento.id], evento)
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
    }) => eventoService.completarTarea(idEvento, idChecklist),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [CHECKLIST_KEY, vars.idEvento] })
      toast.success('Tarea completada.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo completar la tarea.'),
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
    }) => eventoService.descompletarTarea(idEvento, idChecklist),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [CHECKLIST_KEY, vars.idEvento] })
      toast.success('Tarea desmarcada.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo desmarcar la tarea.'),
  })
}
