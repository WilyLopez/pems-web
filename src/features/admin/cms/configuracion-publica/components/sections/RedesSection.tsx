import { Share2 } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '../shared/SectionTitle'
import { FormField } from '../shared/FormField'
import type { FormValues } from '../../types'

const NETWORKS: { label: string; id: string; key: 'facebookUrl' | 'instagramUrl' | 'tiktokUrl' | 'youtubeUrl' }[] = [
  { label: 'Facebook',  id: 'facebookUrl',  key: 'facebookUrl'  },
  { label: 'Instagram', id: 'instagramUrl', key: 'instagramUrl' },
  { label: 'TikTok',    id: 'tiktokUrl',    key: 'tiktokUrl'    },
  { label: 'YouTube',   id: 'youtubeUrl',   key: 'youtubeUrl'   },
]

interface Props {
  register: UseFormRegister<FormValues>
  errors:   FieldErrors<FormValues>
}

export function RedesSection({ register, errors }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SectionTitle icon={Share2} label="Redes sociales" />
        <div className="space-y-3">
          {NETWORKS.map(({ label, id, key }) => (
            <FormField key={id} label={label} id={id} error={errors[key]?.message}>
              <Input id={id} {...register(key)} placeholder="https://..." />
            </FormField>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
