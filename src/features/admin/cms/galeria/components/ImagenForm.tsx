'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  metadatosImagenSchema,
  MetadatosImagenFormValues,
} from '../schemas/galeria.schema'
import { OPCIONES_CATEGORIA } from '../constants/categorias'

interface ImagenFormProps {
  defaultValues: MetadatosImagenFormValues
  onSubmit: (values: MetadatosImagenFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function ImagenForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ImagenFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MetadatosImagenFormValues>({
    resolver: zodResolver(metadatosImagenSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          {...register('titulo')}
          className="mt-1"
          placeholder="Nombre visible de la imagen"
        />
        {errors.titulo && (
          <p className="mt-1 text-xs text-destructive">
            {errors.titulo.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          rows={3}
          {...register('descripcion')}
          className="mt-1 resize-none"
          placeholder="Detalle opcional de la imagen"
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-destructive">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="altTexto">Texto alternativo</Label>
        <Input
          id="altTexto"
          {...register('altTexto')}
          className="mt-1"
          placeholder="Descripción para accesibilidad y SEO"
        />
        {errors.altTexto && (
          <p className="mt-1 text-xs text-destructive">
            {errors.altTexto.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoria">Categoría</Label>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categoria" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPCIONES_CATEGORIA.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoria && (
            <p className="mt-1 text-xs text-destructive">
              {errors.categoria.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="orden">Orden</Label>
          <Input
            id="orden"
            type="number"
            min={0}
            {...register('orden')}
            className="mt-1"
          />
          {errors.orden && (
            <p className="mt-1 text-xs text-destructive">
              {errors.orden.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-azul text-white"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
