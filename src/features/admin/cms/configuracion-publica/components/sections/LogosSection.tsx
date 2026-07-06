import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { Controller, useFormState } from 'react-hook-form'
import { SectionTitle } from '../shared/SectionTitle'
import { ImageUploadField } from '../shared/ImageUploadField'
import { CampoEditableCard } from '../shared/CampoEditableCard'
import type { FormValues } from '../../types'

interface Props {
  control: Control<FormValues>
  onGuardarCampo: () => void
  guardando: boolean
}

interface CampoMarca {
  name: keyof FormValues
  label: string
  tipo: string
  hint?: string
}

const CAMPOS: CampoMarca[] = [
  {
    name: 'logoUrl',
    label: 'Logo principal',
    tipo: 'logo',
    hint: 'Se muestra en el navbar y el footer del sitio',
  },
  {
    name: 'logoSecundarioUrl',
    label: 'Logo secundario',
    tipo: 'logo-secundario',
    hint: 'Alternativo, para fondos oscuros u otros usos',
  },
  { name: 'mascota1Url', label: 'Mascota 1', tipo: 'mascota-1' },
  { name: 'mascota2Url', label: 'Mascota 2', tipo: 'mascota-2' },
  {
    name: 'faviconUrl',
    label: 'Favicon',
    tipo: 'favicon',
    hint: 'Ícono de la pestaña del navegador. Recomendado: cuadrado, 512×512 px',
  },
]

function LogoCard({
  campo,
  control,
  onGuardarCampo,
  guardando,
}: {
  campo: CampoMarca
  control: Control<FormValues>
  onGuardarCampo: (campo: keyof FormValues) => void
  guardando: boolean
}) {
  const { dirtyFields } = useFormState({ control, name: campo.name })
  const esDirty = !!dirtyFields[campo.name]

  return (
    <CampoEditableCard
      titulo={campo.label}
      hint={campo.hint}
      esDirty={esDirty}
      guardando={guardando}
      onGuardar={() => onGuardarCampo(campo.name)}
    >
      <Controller
        name={campo.name}
        control={control}
        render={({ field }) => (
          <ImageUploadField
            tipo={campo.tipo}
            value={(field.value as string) ?? ''}
            onChange={field.onChange}
          />
        )}
      />
    </CampoEditableCard>
  )
}

export function LogosSection({ control, onGuardarCampo, guardando }: Props) {
  const [campoGuardando, setCampoGuardando] = useState<keyof FormValues | null>(
    null
  )

  function handleGuardarCampo(campo: keyof FormValues) {
    setCampoGuardando(campo)
    onGuardarCampo()
  }

  return (
    <div className="space-y-4">
      <SectionTitle icon={ImageIcon} label="Marca" />
      <div className="grid sm:grid-cols-2 gap-4">
        {CAMPOS.map((campo) => (
          <LogoCard
            key={campo.name}
            campo={campo}
            control={control}
            onGuardarCampo={handleGuardarCampo}
            guardando={guardando && campoGuardando === campo.name}
          />
        ))}
      </div>
    </div>
  )
}
