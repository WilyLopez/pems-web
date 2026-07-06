'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracionPublica,
} from '@/hooks/useConfiguracionPublica'
import { schema, type FormValues } from '../types'
import { aWhatsappInternacional, formatearParaMostrar } from '../utils/telefono'
import type { ActualizarConfiguracionPayload } from '@/types/configuracion-publica.types'

export function useConfiguracionPublicaForm() {
  const { data: config, isLoading, isError, refetch } = useConfiguracionAdmin()
  const actualizar = useActualizarConfiguracionPublica()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { nombreNegocio: '' },
  })

  useEffect(() => {
    if (!config) return
    form.reset({
      nombreNegocio: config.nombreNegocio ?? '',
      slogan: config.slogan ?? '',
      copyrightTexto: config.copyrightTexto ?? '',
      logoUrl: config.logoUrl ?? '',
      logoSecundarioUrl: config.logoSecundarioUrl ?? '',
      mascota1Url: config.mascota1Url ?? '',
      mascota2Url: config.mascota2Url ?? '',
      faviconUrl: config.faviconUrl ?? '',
      telefono: formatearParaMostrar(config.telefono),
      telefonoSecundario: formatearParaMostrar(config.telefonoSecundario),
      whatsapp: formatearParaMostrar(config.whatsapp),
      correo: config.correo ?? '',
      correoSecundario: config.correoSecundario ?? '',
      facebookUrl: config.facebookUrl ?? '',
      instagramUrl: config.instagramUrl ?? '',
      tiktokUrl: config.tiktokUrl ?? '',
      youtubeUrl: config.youtubeUrl ?? '',
    })
  }, [config, form])

  function onSubmit(data: FormValues) {
    if (!config) return
    const payload: ActualizarConfiguracionPayload = {
      ...data,
      mantenimientoActivo: config.mantenimientoActivo,
      mensajeMantenimiento: config.mensajeMantenimiento,
      metricasNegocio: config.metricasNegocio,
      whatsapp: aWhatsappInternacional(data.whatsapp) || undefined,
      logoUrl: data.logoUrl || undefined,
      logoSecundarioUrl: data.logoSecundarioUrl || undefined,
      mascota1Url: data.mascota1Url || undefined,
      mascota2Url: data.mascota2Url || undefined,
      faviconUrl: data.faviconUrl || undefined,
      correo: data.correo || undefined,
      correoSecundario: data.correoSecundario || undefined,
      facebookUrl: data.facebookUrl || undefined,
      instagramUrl: data.instagramUrl || undefined,
      tiktokUrl: data.tiktokUrl || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
    }
    actualizar.mutate(payload)
  }

  return {
    form,
    isLoading,
    isError,
    refetch,
    isPending: actualizar.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDirty: form.formState.isDirty,
  }
}
