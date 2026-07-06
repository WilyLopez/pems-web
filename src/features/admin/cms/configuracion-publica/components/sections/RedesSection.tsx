'use client'

import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import { Share2, Pencil, Save, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '../shared/SectionTitle'
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/components/icons/SocialIcons'
import type { FormValues } from '../../types'

interface Red {
  key: 'facebookUrl' | 'instagramUrl' | 'tiktokUrl' | 'youtubeUrl'
  label: string
  icono: ComponentType<SVGProps<SVGSVGElement>>
  color: string
  placeholder: string
}

const REDES: Red[] = [
  {
    key: 'facebookUrl',
    label: 'Facebook',
    icono: FacebookIcon,
    color: 'bg-[#1877F2]/10 text-[#1877F2]',
    placeholder: 'https://facebook.com/tunegocio',
  },
  {
    key: 'instagramUrl',
    label: 'Instagram',
    icono: InstagramIcon,
    color: 'bg-[#E1306C]/10 text-[#E1306C]',
    placeholder: 'https://instagram.com/tunegocio',
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    icono: TiktokIcon,
    color: 'bg-foreground/10 text-foreground',
    placeholder: 'https://tiktok.com/@tunegocio',
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    icono: YoutubeIcon,
    color: 'bg-[#FF0000]/10 text-[#FF0000]',
    placeholder: 'https://youtube.com/@tunegocio',
  },
]

interface Props {
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  onGuardarCampo: () => void
  guardando: boolean
}

function RedCard({
  red,
  control,
  errors,
  onGuardarCampo,
  guardando,
}: {
  red: Red
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  onGuardarCampo: (campo: keyof FormValues) => void
  guardando: boolean
}) {
  const { dirtyFields } = useFormState({ control, name: red.key })
  const esDirty = !!dirtyFields[red.key]
  const error = errors[red.key]?.message
  const valor = useWatch({ control, name: red.key })
  const [editando, setEditando] = useState(false)
  const Icono = red.icono

  function handleGuardar() {
    onGuardarCampo(red.key)
    setEditando(false)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${red.color}`}
          >
            <Icono className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-card-foreground flex-1">
            {red.label}
          </p>
          {esDirty && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
              Sin guardar
            </span>
          )}
        </div>

        <Controller
          name={red.key}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder={red.placeholder}
              disabled={!editando}
            />
          )}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!valor}
            onClick={() => window.open(valor, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={editando}
            onClick={() => setEditando(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!esDirty || guardando}
            onClick={handleGuardar}
          >
            {guardando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function RedesSection({
  control,
  errors,
  onGuardarCampo,
  guardando,
}: Props) {
  const [campoGuardando, setCampoGuardando] = useState<keyof FormValues | null>(
    null
  )

  function handleGuardarCampo(campo: keyof FormValues) {
    setCampoGuardando(campo)
    onGuardarCampo()
  }

  return (
    <div className="space-y-4">
      <SectionTitle icon={Share2} label="Redes sociales" />
      <div className="grid sm:grid-cols-2 gap-4">
        {REDES.map((red) => (
          <RedCard
            key={red.key}
            red={red}
            control={control}
            errors={errors}
            onGuardarCampo={handleGuardarCampo}
            guardando={guardando && campoGuardando === red.key}
          />
        ))}
      </div>
    </div>
  )
}
