'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { CheckCircle2, Loader2, Mail, UserPlus, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ApiError } from '@/types/api.types'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { useMutacionesUsuario } from '../../hooks/useUsuariosData'
import {
  crearUsuarioSchema,
  CrearUsuarioFormValues,
} from '../../schema/usuario.schema'

interface CrearUsuarioDialogProps {
  idSede: number
}

function toTitleCase(value: string): string {
  return value.trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

function handleTelefonoChange(
  e: React.ChangeEvent<HTMLInputElement>,
  rHFOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
  if (raw.length > 0 && raw[0] !== '9') return
  e.target.value = raw
  rHFOnChange(e)
}

function FieldIcon({
  touched,
  hasError,
}: {
  touched: boolean
  hasError: boolean
}) {
  if (!touched) return null
  return hasError ? (
    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  ) : (
    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
  )
}

export function CrearUsuarioDialog({ idSede }: CrearUsuarioDialogProps) {
  const { modal, closeModal } = useUsuariosNav()
  const { crearUsuario } = useMutacionesUsuario()

  const open = modal === 'nuevo'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, touchedFields },
  } = useForm<CrearUsuarioFormValues>({
    resolver: zodResolver(crearUsuarioSchema),
    mode: 'onChange',
    defaultValues: { rol: 'ADMIN' },
  })

  const handleClose = () => {
    reset()
    closeModal()
  }

  const onSubmit = (values: CrearUsuarioFormValues) => {
    crearUsuario.mutate(
      { idSede, payload: values },
      {
        onSuccess: () => {
          toast.success('Usuario creado correctamente.')
          toast.info(`Se envió un enlace de activación a ${values.correo}`)
          handleClose()
        },
        onError: (err) => {
          const apiError = err as unknown as ApiError
          const errCampos = apiError.erroresCampo ?? []
          const correoErr = errCampos.find((c) => c.campo === 'correo')
          if (correoErr) {
            setError('correo', { message: correoErr.mensaje })
          } else {
            toast.error(apiError.message ?? 'No se pudo crear el usuario.')
          }
        },
      }
    )
  }

  const {
    onBlur: onNombreBlur,
    onChange: onNombreChange,
    ...nombreRest
  } = register('nombre')

  const { onChange: onTelefonoChange, ...telefonoRest } = register('telefono')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" />
            Nuevo usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="c-nombre">Nombre completo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="c-nombre"
                placeholder="María López"
                className={cn(
                  touchedFields.nombre &&
                    errors.nombre &&
                    'border-red-400 focus-visible:ring-red-300',
                  touchedFields.nombre &&
                    !errors.nombre &&
                    'border-green-400 focus-visible:ring-green-300'
                )}
                {...nombreRest}
                onChange={onNombreChange}
                onBlur={(e) => {
                  setValue('nombre', toTitleCase(e.target.value), {
                    shouldValidate: true,
                  })
                  onNombreBlur(e)
                }}
              />
              <FieldIcon
                touched={!!touchedFields.nombre}
                hasError={!!errors.nombre}
              />
            </div>
            {touchedFields.nombre && errors.nombre && (
              <p className="text-xs text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-correo">Correo electrónico</Label>
            <div className="flex items-center gap-2">
              <Input
                id="c-correo"
                type="email"
                placeholder="usuario@ejemplo.pe"
                className={cn(
                  errors.correo && 'border-red-400 focus-visible:ring-red-300',
                  touchedFields.correo &&
                    !errors.correo &&
                    'border-green-400 focus-visible:ring-green-300'
                )}
                {...register('correo')}
              />
              <FieldIcon
                touched={!!touchedFields.correo}
                hasError={!!errors.correo}
              />
            </div>
            {errors.correo && (
              <p className="text-xs text-destructive">
                {errors.correo.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select
                defaultValue="ADMIN"
                onValueChange={(v) => setValue('rol', v as 'ADMIN' | 'CAJERO')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="CAJERO">Cajero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-telefono">Teléfono</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="c-telefono"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="9XXXXXXXX"
                  className={cn(
                    touchedFields.telefono &&
                      errors.telefono &&
                      'border-red-400 focus-visible:ring-red-300',
                    touchedFields.telefono &&
                      !errors.telefono &&
                      watch('telefono') &&
                      'border-green-400 focus-visible:ring-green-300'
                  )}
                  {...telefonoRest}
                  onChange={(e) => handleTelefonoChange(e, onTelefonoChange)}
                />
                {watch('telefono') && (
                  <FieldIcon
                    touched={!!touchedFields.telefono}
                    hasError={!!errors.telefono}
                  />
                )}
              </div>
              {touchedFields.telefono && errors.telefono && (
                <p className="text-xs text-destructive">
                  {errors.telefono.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Se enviará un enlace de activación a{' '}
              <strong>{watch('correo') || 'el correo ingresado'}</strong> para
              que el usuario defina su propia contraseña.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearUsuario.isPending}>
              {crearUsuario.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                </>
              ) : (
                'Crear usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
