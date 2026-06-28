'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracionPublica,
} from '@/hooks/useConfiguracionPublica'
import { schema, type FormValues } from '../types'
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
      faviconUrl: config.faviconUrl ?? '',
      telefono: config.telefono ?? '',
      telefonoSecundario: config.telefonoSecundario ?? '',
      whatsapp: config.whatsapp ?? '',
      correo: config.correo ?? '',
      correoSecundario: config.correoSecundario ?? '',
      direccion: config.direccion ?? '',
      googleMapsUrl: config.googleMapsUrl ?? '',
      horarioSemana: config.horarioSemana ?? '',
      horarioFinDeSemana: config.horarioFinDeSemana ?? '',
      facebookUrl: config.facebookUrl ?? '',
      instagramUrl: config.instagramUrl ?? '',
      tiktokUrl: config.tiktokUrl ?? '',
      youtubeUrl: config.youtubeUrl ?? '',
      metaTitle: config.metaTitle ?? '',
      metaDescription: config.metaDescription ?? '',
      metaKeywords: config.metaKeywords ?? '',
      openGraphTitle: config.openGraphTitle ?? '',
      openGraphDescription: config.openGraphDescription ?? '',
      openGraphImageUrl: config.openGraphImageUrl ?? '',
      googleAnalyticsId: config.googleAnalyticsId ?? '',
      metaPixelId: config.metaPixelId ?? '',
      colorTema: config.colorTema ?? '',
      colorSecundario: config.colorSecundario ?? '',
    })
  }, [config, form])

  function onSubmit(data: FormValues) {
    if (!config) return
    const payload: ActualizarConfiguracionPayload = {
      ...config,
      ...data,
      logoUrl: data.logoUrl || undefined,
      faviconUrl: data.faviconUrl || undefined,
      correo: data.correo || undefined,
      correoSecundario: data.correoSecundario || undefined,
      googleMapsUrl: data.googleMapsUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      instagramUrl: data.instagramUrl || undefined,
      tiktokUrl: data.tiktokUrl || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
      openGraphImageUrl: data.openGraphImageUrl || undefined,
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
