import Link from 'next/link'
import { Phone, Mail, Clock, ArrowRight, MessageCircle } from 'lucide-react'
import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '../shared/SectionTitle'
import { FormField } from '../shared/FormField'
import { PhoneInput } from '../shared/PhoneInput'
import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { formatHora12h, formatDiasOperacion } from '@/lib/horario'
import { aWhatsappInternacional, soloDigitos } from '../../utils/telefono'
import type { FormValues } from '../../types'

interface Props {
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  control: Control<FormValues>
}

export function ContactoSection({ register, errors, control }: Props) {
  const whatsapp = useWatch({ control, name: 'whatsapp' })
  const { idSede } = useAuth()
  const { data: operacion } = useConfiguracionCalendarioPublica(idSede ?? 0)
  const whatsappValido = soloDigitos(whatsapp).length === 9

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Phone} label="Teléfonos y WhatsApp" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Teléfono principal"
              id="telefono"
              error={errors.telefono?.message}
            >
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="telefono"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Teléfono secundario"
              id="telefonoSecundario"
              error={errors.telefonoSecundario?.message}
            >
              <Controller
                name="telefonoSecundario"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="telefonoSecundario"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
            <FormField
              label="WhatsApp"
              id="whatsapp"
              error={errors.whatsapp?.message}
            >
              <div className="flex gap-2">
                <Controller
                  name="whatsapp"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="whatsapp"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!whatsappValido}
                  onClick={() =>
                    window.open(
                      `https://wa.me/${aWhatsappInternacional(whatsapp)}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Probar
                </Button>
              </div>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Mail} label="Correos electrónicos" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Correo principal"
              id="correo"
              error={errors.correo?.message}
            >
              <Input
                id="correo"
                type="email"
                {...register('correo')}
                placeholder="contacto@example.com"
              />
            </FormField>
            <FormField
              label="Correo secundario"
              id="correoSecundario"
              error={errors.correoSecundario?.message}
            >
              <Input
                id="correoSecundario"
                type="email"
                {...register('correoSecundario')}
                placeholder="reservas@example.com"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Clock} label="Horarios de atención" />
          <p className="text-xs text-muted-foreground -mt-2">
            Se muestran en el sitio web y se editan en{' '}
            <strong>Configuración → Operación</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Días de operación
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-0.5">
                {operacion ? formatDiasOperacion(operacion.diasOperacion) : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Horario
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-0.5">
                {operacion
                  ? `${formatHora12h(operacion.horaApertura)} – ${formatHora12h(operacion.horaCierre)}`
                  : '—'}
              </p>
            </div>
          </div>
          <Link
            href="/admin/configuracion/operacion"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-azul hover:underline"
          >
            Editar en Configuración → Operación
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
