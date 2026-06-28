import { Image as ImageIcon } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { SectionTitle } from '../shared/SectionTitle'
import { ImageUploadField } from '../shared/ImageUploadField'
import type { FormValues } from '../../types'

interface Props {
  control: Control<FormValues>
}

export function LogosSection({ control }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <SectionTitle icon={ImageIcon} label="Logo y favicon" />
        <Controller
          name="logoUrl"
          control={control}
          render={({ field }) => (
            <ImageUploadField
              label="Logo principal"
              tipo="logo"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        <div className="border-t border-border pt-6">
          <Controller
            name="faviconUrl"
            control={control}
            render={({ field }) => (
              <ImageUploadField
                label="Favicon"
                tipo="favicon"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
