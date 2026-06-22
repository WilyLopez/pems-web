'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { preferenciasService } from '@/services/preferencias.service'
import { useAdminPreferencesStore } from '@/lib/store/admin-preferences.store'
import { PatchPreferenciaPayload } from '@/types/preferencias.types'

export const PREFERENCIAS_KEY = ['admin-preferencias']

export function useAdminPreferences() {
  const { setPreferences } = useAdminPreferencesStore()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: PREFERENCIAS_KEY,
    queryFn: preferenciasService.getMias,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) {
      setPreferences(query.data)
    }
  }, [query.data, setPreferences])

  return query
}

export function useActualizarPreferencias() {
  const qc = useQueryClient()
  const { setPreferences } = useAdminPreferencesStore()

  return useMutation({
    mutationFn: preferenciasService.actualizar,
    onSuccess: (data) => {
      qc.setQueryData(PREFERENCIAS_KEY, data)
      setPreferences(data)
      toast.success('Preferencias guardadas.')
    },
    onError: () => toast.error('No se pudieron guardar las preferencias.'),
  })
}

export function useParchearPreferencias() {
  const qc = useQueryClient()
  const { patchLocal, setPreferences } = useAdminPreferencesStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: preferenciasService.parchear,
    onSuccess: (data) => {
      qc.setQueryData(PREFERENCIAS_KEY, data)
      setPreferences(data)
    },
    onError: () => toast.error('Error al guardar cambios.'),
  })

  function patchDebounced(payload: PatchPreferenciaPayload, delayMs = 800) {
    patchLocal(payload as Parameters<typeof patchLocal>[0])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => mutation.mutate(payload), delayMs)
  }

  return { ...mutation, patchDebounced }
}

export function useResetPreferencias() {
  const qc = useQueryClient()
  const { setPreferences } = useAdminPreferencesStore()

  return useMutation({
    mutationFn: preferenciasService.reset,
    onSuccess: (data) => {
      qc.setQueryData(PREFERENCIAS_KEY, data)
      setPreferences(data)
      toast.success('Preferencias restablecidas.')
    },
    onError: () => toast.error('No se pudieron restablecer las preferencias.'),
  })
}
