import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '../shared/SectionTitle'
import { FormField } from '../shared/FormField'
import type { FormValues } from '../../types'

interface Props {
  register: UseFormRegister<FormValues>
  errors:   FieldErrors<FormValues>
  control:  Control<FormValues>
}

export function ContactoSection({ register, errors, control }: Props) {
  const direccion         = useWatch({ control, name: 'direccion' })
  const horarioSemana     = useWatch({ control, name: 'horarioSemana' })
  const horarioFinDeSemana = useWatch({ control, name: 'horarioFinDeSemana' })

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Phone} label="Teléfonos y WhatsApp" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Teléfono principal" id="telefono">
              <Input id="telefono" {...register('telefono')} placeholder="+51 74 123456" />
            </FormField>
            <FormField label="Teléfono secundario" id="telefonoSecundario">
              <Input id="telefonoSecundario" {...register('telefonoSecundario')} placeholder="+51 74 654321" />
            </FormField>
            <FormField
              label="WhatsApp"
              id="whatsapp"
              hint="Solo números sin espacios ni guiones (ej: 51974123456)"
              error={errors.whatsapp?.message}
            >
              <Input id="whatsapp" {...register('whatsapp')} placeholder="51974123456" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Mail} label="Correos electrónicos" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Correo principal" id="correo" error={errors.correo?.message}>
              <Input id="correo" type="email" {...register('correo')} placeholder="contacto@example.com" />
            </FormField>
            <FormField label="Correo secundario" id="correoSecundario" error={errors.correoSecundario?.message}>
              <Input id="correoSecundario" type="email" {...register('correoSecundario')} placeholder="reservas@example.com" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={MapPin} label="Dirección y ubicación" />
          <FormField
            label="Dirección"
            id="direccion"
            maxLength={300}
            currentLength={(direccion ?? '').length}
          >
            <Input id="direccion" {...register('direccion')} placeholder="Av. Ejemplo 123, Chiclayo" />
          </FormField>
          <FormField
            label="Enlace Google Maps"
            id="googleMapsUrl"
            error={errors.googleMapsUrl?.message}
            hint="URL del lugar en Google Maps para el botón de 'Cómo llegar'"
          >
            <Input id="googleMapsUrl" {...register('googleMapsUrl')} placeholder="https://maps.google.com/..." />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionTitle icon={Clock} label="Horarios de atención" />
          <p className="text-xs text-muted-foreground -mt-2">
            Texto libre que se muestra en el sitio web. Los horarios operativos se configuran en <strong>Configuración → Operación</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Horario de semana"
              id="horarioSemana"
              maxLength={100}
              currentLength={(horarioSemana ?? '').length}
            >
              <Input id="horarioSemana" {...register('horarioSemana')} placeholder="Lun–Vie 9:00 AM – 7:00 PM" />
            </FormField>
            <FormField
              label="Horario fin de semana"
              id="horarioFinDeSemana"
              maxLength={100}
              currentLength={(horarioFinDeSemana ?? '').length}
            >
              <Input id="horarioFinDeSemana" {...register('horarioFinDeSemana')} placeholder="Sáb–Dom 10:00 AM – 8:00 PM" />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
