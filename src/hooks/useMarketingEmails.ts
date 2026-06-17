import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { marketingEmailService } from '@/services/marketingEmail.service'
import { CrearCorreoMarketingPayload, ActualizarCorreoMarketingPayload } from '@/types/marketing.types'

export const CORREOS_KEY = 'correos-marketing'
export const TIPOS_MARKETING_KEY = 'tipos-email-marketing'

export function useTiposMarketing() {
  return useQuery({
    queryKey: [TIPOS_MARKETING_KEY],
    queryFn: marketingEmailService.listarTiposMarketing,
  })
}

export function useCorreosMarketing(page = 0, size = 20) {
  return useQuery({
    queryKey: [CORREOS_KEY, page, size],
    queryFn: () => marketingEmailService.listar(page, size),
  })
}

export function useCorreoMarketing(id: number | null) {
  return useQuery({
    queryKey: [CORREOS_KEY, 'detail', id],
    queryFn: () => marketingEmailService.getById(id!),
    enabled: id !== null,
  })
}

export function useCrearCorreo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearCorreoMarketingPayload) => marketingEmailService.crear(payload),
    onSuccess: () => {
      toast.success('Correo de marketing creado.')
      qc.invalidateQueries({ queryKey: [CORREOS_KEY] })
    },
    onError: () => toast.error('No se pudo crear el correo.'),
  })
}

export function useActualizarCorreo(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActualizarCorreoMarketingPayload) =>
      marketingEmailService.actualizar(id, payload),
    onSuccess: () => {
      toast.success('Correo actualizado.')
      qc.invalidateQueries({ queryKey: [CORREOS_KEY] })
    },
    onError: () => toast.error('No se pudo actualizar el correo.'),
  })
}

export function useToggleCorreo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      marketingEmailService.toggleEstado(id, activa),
    onSuccess: (_data, { activa }) => {
      toast.success(activa ? 'Correo activado.' : 'Correo desactivado.')
      qc.invalidateQueries({ queryKey: [CORREOS_KEY] })
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useEliminarCorreo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => marketingEmailService.eliminar(id),
    onSuccess: () => {
      toast.success('Correo eliminado.')
      qc.invalidateQueries({ queryKey: [CORREOS_KEY] })
    },
    onError: () => toast.error('No se pudo eliminar el correo.'),
  })
}
