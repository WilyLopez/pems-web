'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  UserPlus,
  Wand2,
  XCircle,
} from 'lucide-react'
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
import { useCrearUsuarioAdmin, CrearUsuarioResponse } from '@/hooks/useUsuariosAdmin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { correoField, nombreField, PW_RULES, telefonoOpcionalField } from '@/lib/validations/campos'

const schema = z
  .object({
    nombre:          nombreField,
    correo:          correoField,
    rol:             z.enum(['ADMIN', 'CAJERO']),
    telefono:        telefonoOpcionalField,
    generarPassword: z.boolean(),
    password:        z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.generarPassword) return
    const pw = data.password ?? ''
    PW_RULES.forEach((rule) => {
      if (!rule.test(pw)) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: rule.label })
      }
    })
  })

type FormValues = z.infer<typeof schema>

function FieldIcon({ touched, hasError }: { touched: boolean; hasError: boolean }) {
  if (!touched) return null
  return hasError
    ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
    : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
}

function StrengthIndicator({ password }: { password: string }) {
  if (!password) return null
  return (
    <ul className="mt-1.5 space-y-1">
      {PW_RULES.map((rule) => {
        const ok = rule.test(password)
        return (
          <li
            key={rule.key}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              ok ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {ok
              ? <Check className="h-3 w-3 shrink-0" />
              : <XCircle className="h-3 w-3 shrink-0" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  idSede: number
}

export function CrearUsuarioModal({ open, onClose, idSede }: Props) {
  const crear = useCrearUsuarioAdmin()
  const [passwordCreado, setPasswordCreado] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { rol: 'ADMIN', generarPassword: true },
  })

  const generarPassword = watch('generarPassword')
  const passwordValue   = watch('password') ?? ''

  function onSubmit(values: FormValues) {
    crear.mutate(
      { idSede, ...values },
      {
        onSuccess: (data: CrearUsuarioResponse) => {
          toast.success('Usuario creado correctamente.')
          toast.info(`Credenciales enviadas a ${values.correo}`)
          if (data?.passwordTemporal) {
            setPasswordCreado(data.passwordTemporal)
          } else {
            doClose()
          }
        },
      }
    )
  }

  function doClose() {
    reset()
    setPasswordCreado(null)
    onClose()
  }

  if (passwordCreado) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-green-700">
              Usuario creado correctamente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Comparte esta contraseña temporal con el usuario.{' '}
              <strong>Solo se muestra una vez.</strong>
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <span className="flex-1 font-mono text-base font-bold tracking-widest text-green-800 select-all">
                {passwordCreado}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-700 hover:text-green-900"
                onClick={() => {
                  navigator.clipboard.writeText(passwordCreado)
                  toast.success('Contraseña copiada.')
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
              Las credenciales también fueron enviadas a su correo electrónico.
            </p>

            <div className="flex justify-end">
              <Button onClick={doClose}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) doClose() }}>
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
                  touchedFields.nombre && errors.nombre && 'border-red-400 focus-visible:ring-red-300',
                  touchedFields.nombre && !errors.nombre && 'border-green-400 focus-visible:ring-green-300'
                )}
                {...register('nombre')}
              />
              <FieldIcon touched={!!touchedFields.nombre} hasError={!!errors.nombre} />
            </div>
            {touchedFields.nombre && errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
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
                  touchedFields.correo && errors.correo && 'border-red-400 focus-visible:ring-red-300',
                  touchedFields.correo && !errors.correo && 'border-green-400 focus-visible:ring-green-300'
                )}
                {...register('correo')}
              />
              <FieldIcon touched={!!touchedFields.correo} hasError={!!errors.correo} />
            </div>
            {touchedFields.correo && errors.correo && (
              <p className="text-xs text-destructive">{errors.correo.message}</p>
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
                  placeholder="999 999 999"
                  inputMode="tel"
                  className={cn(
                    touchedFields.telefono && errors.telefono && 'border-red-400 focus-visible:ring-red-300',
                    touchedFields.telefono && !errors.telefono && watch('telefono') && 'border-green-400 focus-visible:ring-green-300'
                  )}
                  {...register('telefono')}
                />
                {watch('telefono') && (
                  <FieldIcon touched={!!touchedFields.telefono} hasError={!!errors.telefono} />
                )}
              </div>
              {touchedFields.telefono && errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>

            <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setValue('generarPassword', true)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 py-2 transition-colors',
                  generarPassword
                    ? 'bg-primary text-white font-medium'
                    : 'bg-white text-muted-foreground hover:bg-gray-50'
                )}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Generar automáticamente
              </button>
              <button
                type="button"
                onClick={() => setValue('generarPassword', false)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 py-2 transition-colors',
                  !generarPassword
                    ? 'bg-primary text-white font-medium'
                    : 'bg-white text-muted-foreground hover:bg-gray-50'
                )}
              >
                Definir manualmente
              </button>
            </div>

            {generarPassword && (
              <p className="text-xs text-muted-foreground px-1">
                Se generará una contraseña segura y será enviada al correo del usuario.
              </p>
            )}

            {!generarPassword && (
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(
                    passwordValue && !PW_RULES.every((r) => r.test(passwordValue)) && 'border-red-400 focus-visible:ring-red-300',
                    passwordValue && PW_RULES.every((r) => r.test(passwordValue)) && 'border-green-400 focus-visible:ring-green-300'
                  )}
                  {...register('password')}
                />
                <StrengthIndicator password={passwordValue} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={doClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
