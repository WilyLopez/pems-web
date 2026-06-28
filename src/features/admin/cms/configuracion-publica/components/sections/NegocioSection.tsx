import { Building2 } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '../shared/SectionTitle'
import { FormField } from '../shared/FormField'
import type { FormValues } from '../../types'

interface Props {
  register: UseFormRegister<FormValues>
  errors:   FieldErrors<FormValues>
}

export function NegocioSection({ register, errors }: Props) {
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
