'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Search,
  Palette,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracion,
} from '@/hooks/useConfiguracionPublica'
import { ActualizarConfiguracionPayload } from '@/types/configuracion-publica.types'

const schema = z.object({
  nombreNegocio: z.string().min(1, 'Obligatorio').max(200),
  slogan: z.string().max(300).optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  logoBlancaUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  telefonoPrincipal: z.string().max(30).optional(),
  telefonoSecundario: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  correoContacto: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  correoSoporte: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  direccion: z.string().max(500).optional(),
  ciudad: z.string().max(100).optional(),
  pais: z.string().max(100).optional(),
  latitud: z.coerce.number().optional(),
  longitud: z.coerce.number().optional(),
  horarioLunesViernes: z.string().max(200).optional(),
  horarioSabado: z.string().max(200).optional(),
  horarioDomingo: z.string().max(200).optional(),
  facebookUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  instagramUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  tiktokUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  youtubeUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  metaTitulo: z.string().max(70).optional(),
  metaDescripcion: z.string().max(160).optional(),
  metaKeywords: z.string().max(500).optional(),
  modoMantenimiento: z.boolean().default(false),
  mensajeMantenimiento: z.string().max(500).optional(),
  colorPrimario: z.string().max(20).optional(),
  colorSecundario: z.string().max(20).optional(),
  colorAcento: z.string().max(20).optional(),
})

type FormValues = z.infer<typeof schema>

function FormField({
  label,
  id,
  error,
  children,
  hint,
}: {
  label: string
  id?: string
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
      <div className="w-5 h-5 rounded bg-brand-azul/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-brand-azul" />
      </div>
      {label}
    </div>
  )
}

export default function ConfiguracionPublicaPage() {
  const { data: config, isLoading, isError, refetch } = useConfiguracionAdmin()
  const actualizar = useActualizarConfiguracion()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombreNegocio: '', modoMantenimiento: false },
  })

  useEffect(() => {
    if (config) {
      reset({
        nombreNegocio: config.nombreNegocio ?? '',
        slogan: config.slogan ?? '',
        logoUrl: config.logoUrl ?? '',
        logoBlancaUrl: config.logoBlancaUrl ?? '',
        faviconUrl: config.faviconUrl ?? '',
        telefonoPrincipal: config.telefonoPrincipal ?? '',
        telefonoSecundario: config.telefonoSecundario ?? '',
        whatsapp: config.whatsapp ?? '',
        correoContacto: config.correoContacto ?? '',
        correoSoporte: config.correoSoporte ?? '',
        direccion: config.direccion ?? '',
        ciudad: config.ciudad ?? '',
        pais: config.pais ?? '',
        latitud: config.latitud,
        longitud: config.longitud,
        horarioLunesViernes: config.horarioLunesViernes ?? '',
        horarioSabado: config.horarioSabado ?? '',
        horarioDomingo: config.horarioDomingo ?? '',
        facebookUrl: config.facebookUrl ?? '',
        instagramUrl: config.instagramUrl ?? '',
        tiktokUrl: config.tiktokUrl ?? '',
        youtubeUrl: config.youtubeUrl ?? '',
        metaTitulo: config.metaTitulo ?? '',
        metaDescripcion: config.metaDescripcion ?? '',
        metaKeywords: config.metaKeywords ?? '',
        modoMantenimiento: config.modoMantenimiento,
        mensajeMantenimiento: config.mensajeMantenimiento ?? '',
        colorPrimario: config.colorPrimario ?? '',
        colorSecundario: config.colorSecundario ?? '',
        colorAcento: config.colorAcento ?? '',
      })
    }
  }, [config, reset])

  function onSubmit(data: FormValues) {
    const payload: ActualizarConfiguracionPayload = {
      ...data,
      logoUrl: data.logoUrl || undefined,
      logoBlancaUrl: data.logoBlancaUrl || undefined,
      faviconUrl: data.faviconUrl || undefined,
      correoContacto: data.correoContacto || undefined,
      correoSoporte: data.correoSoporte || undefined,
      facebookUrl: data.facebookUrl || undefined,
      instagramUrl: data.instagramUrl || undefined,
      tiktokUrl: data.tiktokUrl || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
    }
    actualizar.mutate(payload)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Configuración Pública' },
        ]}
      />

      <PageHeader
        title="Configuración Pública"
        description="Datos del negocio, contacto, redes sociales y SEO"
        actions={
          <Button
            type="submit"
            form="config-form"
            disabled={actualizar.isPending || !isDirty}
            className="bg-brand-azul text-white gap-1.5"
          >
            <Save className="h-4 w-4" />
            {actualizar.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        }
      />

      <form id="config-form" onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="negocio" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="negocio" className="text-xs">
              Negocio
            </TabsTrigger>
            <TabsTrigger value="contacto" className="text-xs">
              Contacto
            </TabsTrigger>
            <TabsTrigger value="horarios" className="text-xs">
              Horarios
            </TabsTrigger>
            <TabsTrigger value="redes" className="text-xs">
              Redes sociales
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">
              SEO
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              Visual
            </TabsTrigger>
            <TabsTrigger value="mantenimiento" className="text-xs">
              Mantenimiento
            </TabsTrigger>
          </TabsList>

          {/* TAB: Negocio */}
          <TabsContent value="negocio">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle
                  icon={Building2}
                  label="Información del negocio"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    label="Nombre del negocio *"
                    id="nombreNegocio"
                    error={errors.nombreNegocio?.message}
                  >
                    <Input
                      id="nombreNegocio"
                      {...register('nombreNegocio')}
                      placeholder="Kiki y Lala"
                    />
                  </FormField>
                  <FormField label="Slogan" id="slogan">
                    <Input
                      id="slogan"
                      {...register('slogan')}
                      placeholder="El espacio favorito..."
                    />
                  </FormField>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    label="Logo principal (URL)"
                    id="logoUrl"
                    error={errors.logoUrl?.message}
                    hint="URL de la imagen del logo"
                  >
                    <Input
                      id="logoUrl"
                      {...register('logoUrl')}
                      placeholder="https://..."
                    />
                  </FormField>
                  <FormField
                    label="Logo versión blanca (URL)"
                    id="logoBlancaUrl"
                    error={errors.logoBlancaUrl?.message}
                  >
                    <Input
                      id="logoBlancaUrl"
                      {...register('logoBlancaUrl')}
                      placeholder="https://..."
                    />
                  </FormField>
                  <FormField
                    label="Favicon (URL)"
                    id="faviconUrl"
                    error={errors.faviconUrl?.message}
                  >
                    <Input
                      id="faviconUrl"
                      {...register('faviconUrl')}
                      placeholder="https://..."
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Contacto */}
          <TabsContent value="contacto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={Phone} label="Teléfonos y correos" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Teléfono principal" id="telefonoPrincipal">
                    <Input
                      id="telefonoPrincipal"
                      {...register('telefonoPrincipal')}
                      placeholder="+51 999 000 000"
                    />
                  </FormField>
                  <FormField
                    label="Teléfono secundario"
                    id="telefonoSecundario"
                  >
                    <Input
                      id="telefonoSecundario"
                      {...register('telefonoSecundario')}
                      placeholder="+51 999 000 001"
                    />
                  </FormField>
                  <FormField
                    label="WhatsApp"
                    id="whatsapp"
                    hint="Número completo con código de país"
                  >
                    <Input
                      id="whatsapp"
                      {...register('whatsapp')}
                      placeholder="51999000000"
                    />
                  </FormField>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    label="Correo de contacto"
                    id="correoContacto"
                    error={errors.correoContacto?.message}
                  >
                    <Input
                      id="correoContacto"
                      type="email"
                      {...register('correoContacto')}
                      placeholder="hola@ejemplo.com"
                    />
                  </FormField>
                  <FormField
                    label="Correo de soporte"
                    id="correoSoporte"
                    error={errors.correoSoporte?.message}
                  >
                    <Input
                      id="correoSoporte"
                      type="email"
                      {...register('correoSoporte')}
                      placeholder="soporte@ejemplo.com"
                    />
                  </FormField>
                </div>

                <SectionTitle icon={MapPin} label="Dirección" />
                <FormField label="Dirección" id="direccion">
                  <Input
                    id="direccion"
                    {...register('direccion')}
                    placeholder="Av. Principal 123"
                  />
                </FormField>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Ciudad" id="ciudad">
                    <Input
                      id="ciudad"
                      {...register('ciudad')}
                      placeholder="Chiclayo"
                    />
                  </FormField>
                  <FormField label="País" id="pais">
                    <Input id="pais" {...register('pais')} placeholder="Perú" />
                  </FormField>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Latitud" id="latitud">
                    <Input
                      id="latitud"
                      type="number"
                      step="any"
                      {...register('latitud')}
                      placeholder="-6.7714"
                    />
                  </FormField>
                  <FormField label="Longitud" id="longitud">
                    <Input
                      id="longitud"
                      type="number"
                      step="any"
                      {...register('longitud')}
                      placeholder="-79.8410"
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Horarios */}
          <TabsContent value="horarios">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={Clock} label="Horarios de atención" />
                <div className="space-y-3">
                  <FormField label="Lunes a Viernes" id="horarioLunesViernes">
                    <Input
                      id="horarioLunesViernes"
                      {...register('horarioLunesViernes')}
                      placeholder="10:00 am – 8:00 pm"
                    />
                  </FormField>
                  <FormField label="Sábado" id="horarioSabado">
                    <Input
                      id="horarioSabado"
                      {...register('horarioSabado')}
                      placeholder="9:00 am – 9:00 pm"
                    />
                  </FormField>
                  <FormField label="Domingo" id="horarioDomingo">
                    <Input
                      id="horarioDomingo"
                      {...register('horarioDomingo')}
                      placeholder="9:00 am – 9:00 pm"
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Redes */}
          <TabsContent value="redes">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={Share2} label="Redes sociales" />
                <div className="space-y-3">
                  {[
                    {
                      label: 'Facebook',
                      id: 'facebookUrl',
                      key: 'facebookUrl' as const,
                    },
                    {
                      label: 'Instagram',
                      id: 'instagramUrl',
                      key: 'instagramUrl' as const,
                    },
                    {
                      label: 'TikTok',
                      id: 'tiktokUrl',
                      key: 'tiktokUrl' as const,
                    },
                    {
                      label: 'YouTube',
                      id: 'youtubeUrl',
                      key: 'youtubeUrl' as const,
                    },
                  ].map(({ label, id, key }) => (
                    <FormField
                      key={id}
                      label={label}
                      id={id}
                      error={errors[key]?.message}
                    >
                      <Input
                        id={id}
                        {...register(key)}
                        placeholder="https://..."
                      />
                    </FormField>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: SEO */}
          <TabsContent value="seo">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={Search} label="SEO y metadatos" />
                <FormField
                  label="Meta título"
                  id="metaTitulo"
                  hint="Máximo 70 caracteres. Se mostrará en el navegador y resultados de búsqueda."
                >
                  <Input
                    id="metaTitulo"
                    {...register('metaTitulo')}
                    maxLength={70}
                    placeholder="Kiki y Lala — Diversión para niños en Chiclayo"
                  />
                </FormField>
                <FormField
                  label="Meta descripción"
                  id="metaDescripcion"
                  hint="Máximo 160 caracteres. Aparece en resultados de Google."
                >
                  <Textarea
                    id="metaDescripcion"
                    {...register('metaDescripcion')}
                    rows={3}
                    maxLength={160}
                    className="resize-none"
                    placeholder="El espacio de diversión favorito..."
                  />
                </FormField>
                <FormField
                  label="Keywords"
                  id="metaKeywords"
                  hint="Palabras clave separadas por comas"
                >
                  <Textarea
                    id="metaKeywords"
                    {...register('metaKeywords')}
                    rows={2}
                    className="resize-none"
                    placeholder="juegos para niños, cumpleaños, chiclayo"
                  />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Visual */}
          <TabsContent value="visual">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={Palette} label="Colores institucionales" />
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Color primario',
                      id: 'colorPrimario',
                      key: 'colorPrimario' as const,
                    },
                    {
                      label: 'Color secundario',
                      id: 'colorSecundario',
                      key: 'colorSecundario' as const,
                    },
                    {
                      label: 'Color acento',
                      id: 'colorAcento',
                      key: 'colorAcento' as const,
                    },
                  ].map(({ label, id, key }) => (
                    <FormField
                      key={id}
                      label={label}
                      id={id}
                      hint="Ej: #F64B8A o rgb(246,75,138)"
                    >
                      <div className="flex gap-2">
                        <Input
                          id={id}
                          {...register(key)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                        <input
                          type="color"
                          className="h-10 w-10 rounded border cursor-pointer"
                        />
                      </div>
                    </FormField>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Mantenimiento */}
          <TabsContent value="mantenimiento">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SectionTitle icon={AlertTriangle} label="Modo mantenimiento" />
                <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Atención
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Al activar el modo mantenimiento el sitio público mostrará
                      el mensaje configurado en lugar del contenido normal.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modoMantenimiento"
                    {...register('modoMantenimiento')}
                    className="w-4 h-4 rounded"
                  />
                  <Label
                    htmlFor="modoMantenimiento"
                    className="cursor-pointer font-medium"
                  >
                    Activar modo mantenimiento
                  </Label>
                </div>
                <FormField
                  label="Mensaje de mantenimiento"
                  id="mensajeMantenimiento"
                  hint="Se mostrará a los visitantes mientras el modo mantenimiento esté activo"
                >
                  <Textarea
                    id="mensajeMantenimiento"
                    {...register('mensajeMantenimiento')}
                    rows={3}
                    className="resize-none"
                    placeholder="Estamos mejorando el sitio para ti. Volvemos pronto..."
                  />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
