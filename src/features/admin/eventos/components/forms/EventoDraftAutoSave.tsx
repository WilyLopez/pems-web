'use client'

import { useEffect } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { NuevoEventoFormValues } from '../../schema/nuevoEvento.schema'
import { EventoDraft } from '../../types'
import { Cliente } from '@/features/admin/clientes/types'
import { TipoEvento } from '@/types/comercial.types'

interface EventoDraftAutoSaveProps {
  control: Control<NuevoEventoFormValues>
  draftKey: string
  clienteSel: Cliente | null
  clienteSearch: string
  tipoEventoSel: TipoEvento | null
}

/**
 * Componente sin salida visual: aísla la suscripción a todos los campos del
 * formulario (necesaria para el autoguardado del borrador) para que sus
 * re-renders no se propaguen a NuevoEventoForm en cada tecla.
 */
export function EventoDraftAutoSave({
  control,
  draftKey,
  clienteSel,
  clienteSearch,
  tipoEventoSel,
}: EventoDraftAutoSaveProps) {
  const formValues = useWatch({ control })

  useEffect(() => {
    if (!draftKey) return
    const draft: EventoDraft = {
      formValues: formValues as Partial<NuevoEventoFormValues>,
      clienteSel,
      clienteSearch,
      tipoEventoSel,
    }
    sessionStorage.setItem(draftKey, JSON.stringify(draft))
  }, [draftKey, formValues, clienteSel, clienteSearch, tipoEventoSel])

  return null
}
