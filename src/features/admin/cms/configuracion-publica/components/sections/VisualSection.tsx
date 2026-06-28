import { Palette, Eye, Globe } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SectionTitle } from '../shared/SectionTitle'
import { isValidHex, type FormValues } from '../../types'

const COLOR_FIELDS: { label: string; name: 'colorTema' | 'colorSecundario' }[] = [
  { label: 'Color primario',   name: 'colorTema'       },
  { label: 'Color secundario', name: 'colorSecundario'  },
]

interface Props {
  control: Control<FormValues>
}

export function VisualSection({ control }: Props) {
  const colorTema       = useWatch({ control, name: 'colorTema' })
  const colorSecundario = useWatch({ control, name: 'colorSecundario' })
  const slogan          = useWatch({ control, name: 'slogan' })

  const p = isValidHex(colorTema)       ? colorTema       : '#1e40af'
  const s = isValidHex(colorSecundario) ? colorSecundario : '#7c3aed'

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-5">
          <SectionTitle icon={Palette} label="Colores institucionales" />
          <div className="grid sm:grid-cols-2 gap-5">
            {COLOR_FIELDS.map(({ label, name }) => (
              <div key={name}>
                <Label className="text-sm font-medium mb-2 block">{label}</Label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={isValidHex(field.value) ? field.value : '#000000'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
                        />
                        <Input
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          placeholder="#000000"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                      {field.value && (
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: field.value }} />
                      )}
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
          <div className="rounded-xl border border-border overflow-hidden shadow-sm max-w-xs">
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: p }}>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-white/80" />
              </div>
              <span className="text-white text-sm font-semibold">Mi Negocio</span>
            </div>
            <div className="p-4 space-y-3 bg-muted/30">
              <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: s }}>
                Reservar ahora
              </button>
              {slogan && <p className="text-xs text-muted-foreground italic">{slogan}</p>}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s }} />
                <span className="text-xs text-muted-foreground ml-0.5">Paleta</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
