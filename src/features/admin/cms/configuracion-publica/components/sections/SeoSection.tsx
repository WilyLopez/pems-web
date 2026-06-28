import { Search, Eye, Globe } from 'lucide-react'
import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { SectionTitle } from '../shared/SectionTitle'
import { FormField } from '../shared/FormField'
import type { FormValues } from '../../types'

interface Props {
  register: UseFormRegister<FormValues>
  control:  Control<FormValues>
  errors:   FieldErrors<FormValues>
}

export function SeoSection({ register, control, errors }: Props) {
  const metaTitle       = useWatch({ control, name: 'metaTitle' })
  const metaDescription = useWatch({ control, name: 'metaDescription' })
  const titleLen = (metaTitle ?? '').length
  const descLen  = (metaDescription ?? '').length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Search} label="Meta tags" />
          <FormField
            label="Meta título"
            id="metaTitle"
            hint={`${titleLen}/70 — Aparece en el navegador y resultados de búsqueda`}
            error={titleLen > 60 ? 'El título supera 60 caracteres y puede truncarse en algunos resultados.' : undefined}
          >
            <Input
              id="metaTitle"
              {...register('metaTitle')}
              maxLength={70}
              placeholder="Mi negocio — El mejor espacio para niños en Chiclayo"
            />
          </FormField>
          <FormField label="Meta descripción" id="metaDescription" hint={`${descLen}/160 — Aparece bajo el título en Google`}>
            <Textarea
              id="metaDescription"
              {...register('metaDescription')}
              rows={3}
              maxLength={160}
              className="resize-none"
              placeholder="Descripción de tu sitio..."
            />
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
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 max-w-lg shadow-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-muted" />
              <p className="text-xs text-muted-foreground">www.misitio.com</p>
            </div>
            <p className="text-[15px] leading-snug text-[#1558d6] dark:text-blue-400 line-clamp-1">
              {metaTitle || 'Título de la página · Mi negocio'}
            </p>
            <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
              {metaDescription || 'La descripción de tu sitio aparecerá aquí. Usa hasta 160 caracteres para resumir el contenido.'}
            </p>
          </div>
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
            <Textarea
              id="openGraphDescription"
              {...register('openGraphDescription')}
              rows={2}
              className="resize-none"
              placeholder="Descripción para redes sociales..."
            />
          </FormField>
          <FormField
            label="Imagen OG (URL)"
            id="openGraphImageUrl"
            error={errors.openGraphImageUrl?.message}
            hint="Recomendado: 1200×630 px"
          >
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
