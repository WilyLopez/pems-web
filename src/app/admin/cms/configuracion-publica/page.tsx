'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  useForm,
  useWatch,
} from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Save,
  Building2,
  Share2,
  Search,
  Palette,
  Upload,
  History,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Globe,
  AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracionPublica,
} from '@/hooks/useConfiguracionPublica'
import { galeriaService } from '@/services/galeria.service'
import { ActualizarConfiguracionPayload } from '@/types/configuracion-publica.types'

// ── Schema (solo campos exclusivos de la web pública) ─────────────────────────
// Contacto, horarios y mantenimiento están en /admin/configuracion (Sede, Operación, Sistema)

const schema = z.object({
  nombreNegocio:        z.string().min(1, 'Obligatorio').max(200),
  slogan:               z.string().max(300).optional(),
  copyrightTexto:       z.string().max(200).optional(),
  logoUrl:              z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl:           z.string().url('URL inválida').optional().or(z.literal('')),
  facebookUrl:          z.string().url('URL inválida').optional().or(z.literal('')),
  instagramUrl:         z.string().url('URL inválida').optional().or(z.literal('')),
  tiktokUrl:            z.string().url('URL inválida').optional().or(z.literal('')),
  youtubeUrl:           z.string().url('URL inválida').optional().or(z.literal('')),
  metaTitle:            z.string().max(70).optional(),
  metaDescription:      z.string().max(160).optional(),
  metaKeywords:         z.string().max(500).optional(),
  openGraphTitle:       z.string().max(100).optional(),
  openGraphDescription: z.string().max(300).optional(),
  openGraphImageUrl:    z.string().url('URL inválida').optional().or(z.literal('')),
  googleAnalyticsId:    z.string().max(50).optional(),
  metaPixelId:          z.string().max(50).optional(),
  colorTema:            z.string().max(20).optional(),
  colorSecundario:      z.string().max(20).optional(),
})

type FormValues = z.infer<typeof schema>

// ── Navegación lateral (5 secciones, sin duplicados ni mantenimiento) ─────────

type SectionId = 'negocio' | 'logos' | 'redes' | 'seo' | 'visual'

const NAV: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'negocio', label: 'Negocio',        icon: Building2 },
  { id: 'logos',   label: 'Logos & Favicon', icon: ImageIcon },
  { id: 'redes',   label: 'Redes sociales',  icon: Share2    },
  { id: 'seo',     label: 'SEO',             icon: Search    },
  { id: 'visual',  label: 'Visual',          icon: Palette   },
]

// ── Asset history (localStorage como caché temporal de UX) ────────────────────
// TODO: reemplazar con endpoint backend GET /api/v1/assets/history para persistencia real

interface AssetEntry {
  url: string
  nombre: string
  fechaSubida: string
  tamanioBytes?: number
  tipo: 'logo' | 'favicon'
}

const HISTORY_KEY = 'pems_asset_history_v1'

function getHistory(tipo: AssetEntry['tipo']): AssetEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const all: AssetEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    return all.filter((e) => e.tipo === tipo).slice(0, 10)
  } catch { return [] }
}

function addHistory(entry: AssetEntry) {
  if (typeof window === 'undefined') return
  try {
    const all: AssetEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    const deduped = [entry, ...all.filter((e) => e.url !== entry.url)]
    localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped.slice(0, 30)))
  } catch {}
}

function removeHistory(url: string) {
  if (typeof window === 'undefined') return
  try {
    const all: AssetEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all.filter((e) => e.url !== url)))
  } catch {}
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatBytes(n?: number): string {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1_048_576).toFixed(1)} MB`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
  } catch { return '' }
}

function isValidHex(v?: string): v is string {
  return !!v && /^#[0-9a-fA-F]{3,6}$/.test(v)
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
      <div className="w-5 h-5 rounded bg-brand-azul/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-brand-azul" />
      </div>
      {label}
    </div>
  )
}

function FormField({ label, id, error, hint, children }: {
  label: string; id?: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {hint  && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

// ── ImageUploadField ──────────────────────────────────────────────────────────

function ImageUploadField({ label, tipo, value, onChange }: {
  label: string; tipo: AssetEntry['tipo']; value: string; onChange: (url: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory]       = useState<AssetEntry[]>(() => getHistory(tipo))
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten archivos de imagen.'); return }
    setUploading(true)
    try {
      const result = await galeriaService.subir(file, `${tipo}-${Date.now()}`)
      const entry: AssetEntry = {
        url: result.url, nombre: file.name,
        fechaSubida: result.fechaCreacion ?? new Date().toISOString(),
        tamanioBytes: result.tamanioBytes, tipo,
      }
      addHistory(entry)
      setHistory(getHistory(tipo))
      onChange(result.url)
      toast.success('Imagen subida.')
    } catch {
      toast.error('No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <button type="button" onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <History className="h-3 w-3" />
          Historial
          {history.length > 0 && <span className="ml-0.5 font-medium text-brand-azul">({history.length})</span>}
        </button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        El historial se guarda localmente en este navegador.
      </p>

      <div className="flex gap-3">
        <div className="relative w-16 h-16 rounded-xl border-2 bg-gray-50 border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="w-full h-full object-contain p-1.5"
              onError={(e) => { e.currentTarget.style.opacity = '0.2' }} />
          ) : (
            <ImageIcon className="h-5 w-5 text-gray-300" />
          )}
        </div>
        <div
          className={`flex-1 min-h-[64px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-all duration-150 ${
            isDragging ? 'border-brand-azul bg-brand-azul/5' : 'border-gray-200 hover:border-brand-azul/40 hover:bg-gray-50/50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className={`h-4 w-4 ${isDragging ? 'text-brand-azul' : 'text-muted-foreground'}`} />
          <p className={`text-xs ${isDragging ? 'text-brand-azul font-medium' : 'text-muted-foreground'}`}>
            {uploading ? 'Subiendo...' : isDragging ? 'Suelta aquí' : 'Arrastra o haz clic'}
          </p>
          <input ref={inputRef} type="file" accept="image/*" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
        </div>
      </div>

      <Input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="https://... (o sube una imagen)" className="h-8 text-xs font-mono" />

      {showHistory && (
        <div className="rounded-xl border overflow-hidden">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">Sin versiones anteriores</p>
          ) : (
            <div className="divide-y">
              {history.map((entry) => (
                <div key={entry.url} className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className="relative w-9 h-9 rounded-lg border bg-white border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.url} alt="" className="w-full h-full object-contain p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-gray-700">{entry.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {[formatBytes(entry.tamanioBytes), formatDate(entry.fechaSubida)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button type="button" title="Restaurar"
                      onClick={() => { onChange(entry.url); toast.success('URL restaurada.') }}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-brand-azul hover:bg-brand-azul/10 transition-colors">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button type="button" title="Eliminar del historial"
                      onClick={() => { removeHistory(entry.url); setHistory(getHistory(tipo)) }}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function NegocioSection({ register, errors }: { register: UseFormRegister<FormValues>; errors: FieldErrors<FormValues> }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SectionTitle icon={Building2} label="Identidad del negocio" />
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Nombre del negocio *" id="nombreNegocio" error={errors.nombreNegocio?.message}>
            <Input id="nombreNegocio" {...register('nombreNegocio')} placeholder="Kiki y Lala" />
          </FormField>
          <FormField label="Slogan" id="slogan">
            <Input id="slogan" {...register('slogan')} placeholder="El espacio favorito de los niños" />
          </FormField>
        </div>
        <FormField label="Texto de copyright" id="copyrightTexto">
          <Input id="copyrightTexto" {...register('copyrightTexto')} placeholder="© 2025 Kiki y Lala. Todos los derechos reservados." />
        </FormField>
      </CardContent>
    </Card>
  )
}

function LogosSection({ control }: { control: Control<FormValues> }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <SectionTitle icon={ImageIcon} label="Logo y favicon" />
        <Controller name="logoUrl" control={control}
          render={({ field }) => (
            <ImageUploadField label="Logo principal" tipo="logo" value={field.value ?? ''} onChange={field.onChange} />
          )}
        />
        <div className="border-t pt-6">
          <Controller name="faviconUrl" control={control}
            render={({ field }) => (
              <ImageUploadField label="Favicon" tipo="favicon" value={field.value ?? ''} onChange={field.onChange} />
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function RedesSection({ register, errors }: { register: UseFormRegister<FormValues>; errors: FieldErrors<FormValues> }) {
  const networks: { label: string; id: string; key: 'facebookUrl' | 'instagramUrl' | 'tiktokUrl' | 'youtubeUrl' }[] = [
    { label: 'Facebook',  id: 'facebookUrl',  key: 'facebookUrl'  },
    { label: 'Instagram', id: 'instagramUrl', key: 'instagramUrl' },
    { label: 'TikTok',    id: 'tiktokUrl',    key: 'tiktokUrl'    },
    { label: 'YouTube',   id: 'youtubeUrl',   key: 'youtubeUrl'   },
  ]
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SectionTitle icon={Share2} label="Redes sociales" />
        <div className="space-y-3">
          {networks.map(({ label, id, key }) => (
            <FormField key={id} label={label} id={id} error={errors[key]?.message}>
              <Input id={id} {...register(key)} placeholder="https://..." />
            </FormField>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SeoSection({ register, control, errors }: {
  register: UseFormRegister<FormValues>; control: Control<FormValues>; errors: FieldErrors<FormValues>
}) {
  const metaTitle       = useWatch({ control, name: 'metaTitle' })
  const metaDescription = useWatch({ control, name: 'metaDescription' })
  const titleLen = (metaTitle ?? '').length
  const descLen  = (metaDescription ?? '').length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Search} label="Meta tags" />
          <FormField label="Meta título" id="metaTitle" hint={`${titleLen}/70 — Aparece en el navegador y resultados de búsqueda`}>
            <Input id="metaTitle" {...register('metaTitle')} maxLength={70} placeholder="Mi negocio — El mejor espacio para niños en Chiclayo" />
          </FormField>
          <FormField label="Meta descripción" id="metaDescription" hint={`${descLen}/160 — Aparece bajo el título en Google`}>
            <Textarea id="metaDescription" {...register('metaDescription')} rows={3} maxLength={160} className="resize-none" placeholder="Descripción de tu sitio..." />
          </FormField>
          <FormField label="Keywords" id="metaKeywords" hint="Separadas por comas">
            <Input id="metaKeywords" {...register('metaKeywords')} placeholder="juegos para niños, cumpleaños, chiclayo" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
              <Eye className="h-3 w-3 text-green-600" />
            </div>
            Vista previa en buscadores
          </div>
          <div className="rounded-xl border bg-white p-4 space-y-1 max-w-lg shadow-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
              <p className="text-xs text-gray-500">www.misitio.com</p>
            </div>
            <p className="text-[15px] leading-snug text-[#1558d6] line-clamp-1">
              {metaTitle || 'Título de la página · Mi negocio'}
            </p>
            <p className="text-sm text-gray-600 leading-snug line-clamp-2">
              {metaDescription || 'La descripción de tu sitio aparecerá aquí. Usa hasta 160 caracteres para resumir el contenido.'}
            </p>
          </div>
          {titleLen > 60 && <p className="text-xs text-amber-600">El título supera 60 caracteres y puede truncarse en algunos resultados.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Globe} label="Open Graph" />
          <p className="text-xs text-muted-foreground -mt-2">Se usa al compartir el sitio en redes sociales.</p>
          <FormField label="Título OG" id="openGraphTitle">
            <Input id="openGraphTitle" {...register('openGraphTitle')} placeholder="Título que aparece al compartir en redes" />
          </FormField>
          <FormField label="Descripción OG" id="openGraphDescription">
            <Textarea id="openGraphDescription" {...register('openGraphDescription')} rows={2} className="resize-none" placeholder="Descripción para redes sociales..." />
          </FormField>
          <FormField label="Imagen OG (URL)" id="openGraphImageUrl" error={errors.openGraphImageUrl?.message} hint="Recomendado: 1200×630 px">
            <Input id="openGraphImageUrl" {...register('openGraphImageUrl')} placeholder="https://..." />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Search} label="Seguimiento y analytics" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Google Analytics ID" id="googleAnalyticsId" hint="Ej: G-XXXXXXXXXX">
              <Input id="googleAnalyticsId" {...register('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" className="font-mono" />
            </FormField>
            <FormField label="Meta Pixel ID" id="metaPixelId" hint="ID del Pixel de Facebook/Meta">
              <Input id="metaPixelId" {...register('metaPixelId')} placeholder="000000000000000" className="font-mono" />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function VisualSection({ control }: { control: Control<FormValues> }) {
  const colorTema      = useWatch({ control, name: 'colorTema' })
  const colorSecundario = useWatch({ control, name: 'colorSecundario' })
  const slogan          = useWatch({ control, name: 'slogan' })

  const p = isValidHex(colorTema)       ? colorTema       : '#1e40af'
  const s = isValidHex(colorSecundario) ? colorSecundario : '#7c3aed'

  const colorFields: { label: string; name: 'colorTema' | 'colorSecundario' }[] = [
    { label: 'Color primario',   name: 'colorTema'      },
    { label: 'Color secundario', name: 'colorSecundario' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-5">
          <SectionTitle icon={Palette} label="Colores institucionales" />
          <div className="grid sm:grid-cols-2 gap-5">
            {colorFields.map(({ label, name }) => (
              <div key={name}>
                <Label className="text-sm font-medium mb-2 block">{label}</Label>
                <Controller name={name} control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <input type="color"
                          value={isValidHex(field.value) ? field.value : '#000000'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-10 rounded-lg border cursor-pointer p-0.5 bg-white" />
                        <Input value={field.value ?? ''} onChange={field.onChange} placeholder="#000000" className="flex-1 font-mono text-sm" />
                      </div>
                      {field.value && <div className="h-1.5 rounded-full" style={{ backgroundColor: field.value }} />}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
              <Eye className="h-3 w-3 text-purple-600" />
            </div>
            Vista previa branding
          </div>
          <div className="rounded-xl border overflow-hidden shadow-sm max-w-xs">
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: p }}>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-white/80" />
              </div>
              <span className="text-white text-sm font-semibold">Mi Negocio</span>
            </div>
            <div className="p-4 space-y-3 bg-gray-50">
              <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: s }}>
                Reservar ahora
              </button>
              {slogan && <p className="text-xs text-gray-500 italic">{slogan}</p>}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s }} />
                <span className="text-xs text-gray-400 ml-0.5">Paleta</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguracionPublicaPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('negocio')

  const { data: config, isLoading, isError, refetch } = useConfiguracionAdmin()
  const actualizar = useActualizarConfiguracionPublica()

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombreNegocio: '' },
  })

  useEffect(() => {
    if (config) {
      reset({
        nombreNegocio:        config.nombreNegocio        ?? '',
        slogan:               config.slogan               ?? '',
        copyrightTexto:       config.copyrightTexto       ?? '',
        logoUrl:              config.logoUrl              ?? '',
        faviconUrl:           config.faviconUrl           ?? '',
        facebookUrl:          config.facebookUrl          ?? '',
        instagramUrl:         config.instagramUrl         ?? '',
        tiktokUrl:            config.tiktokUrl            ?? '',
        youtubeUrl:           config.youtubeUrl           ?? '',
        metaTitle:            config.metaTitle            ?? '',
        metaDescription:      config.metaDescription      ?? '',
        metaKeywords:         config.metaKeywords         ?? '',
        openGraphTitle:       config.openGraphTitle       ?? '',
        openGraphDescription: config.openGraphDescription ?? '',
        openGraphImageUrl:    config.openGraphImageUrl    ?? '',
        googleAnalyticsId:    config.googleAnalyticsId   ?? '',
        metaPixelId:          config.metaPixelId          ?? '',
        colorTema:            config.colorTema            ?? '',
        colorSecundario:      config.colorSecundario      ?? '',
      })
    }
  }, [config, reset])

  function onSubmit(data: FormValues) {
    if (!config) return
    const payload: ActualizarConfiguracionPayload = {
      ...config,
      ...data,
      logoUrl:           data.logoUrl           || undefined,
      faviconUrl:        data.faviconUrl         || undefined,
      facebookUrl:       data.facebookUrl        || undefined,
      instagramUrl:      data.instagramUrl       || undefined,
      tiktokUrl:         data.tiktokUrl          || undefined,
      youtubeUrl:        data.youtubeUrl         || undefined,
      openGraphImageUrl: data.openGraphImageUrl  || undefined,
    }
    actualizar.mutate(payload)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="flex gap-5">
          <Skeleton className="h-80 w-48 rounded-xl shrink-0" />
          <Skeleton className="h-80 flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Configuración Pública' }]} />

      <PageHeader
        title="Configuración Pública"
        description="Identidad, branding, redes sociales y SEO del sitio web"
        actions={
          <Button type="submit" form="config-form" disabled={actualizar.isPending || !isDirty}
            className="bg-brand-azul text-white gap-1.5">
            <Save className="h-4 w-4" />
            {actualizar.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        }
      />

      <form id="config-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-5 min-h-[500px]">
          <aside className="w-48 shrink-0">
            <nav className="space-y-0.5 sticky top-4">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    activeSection === id
                      ? 'bg-brand-azul text-white font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {activeSection === 'negocio' && <NegocioSection register={register} errors={errors} />}
            {activeSection === 'logos'   && <LogosSection   control={control} />}
            {activeSection === 'redes'   && <RedesSection   register={register} errors={errors} />}
            {activeSection === 'seo'     && <SeoSection     register={register} control={control} errors={errors} />}
            {activeSection === 'visual'  && <VisualSection  control={control} />}
          </div>
        </div>

        {isDirty && (
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/95 backdrop-blur px-4 py-3 mt-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Tienes cambios sin guardar
            </div>
            <Button type="submit" form="config-form" size="sm" disabled={actualizar.isPending}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5">
              <Save className="h-4 w-4" />
              {actualizar.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
