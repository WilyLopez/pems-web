'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldAlert, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracion } from '@/hooks/useConfiguracion'
import { ConfiguracionSistema } from '@/types/configuracion.types'

const schema = z.object({
  INTENTOS_LOGIN_ANTES_BLOQUEO: z.coerce.number().int().min(1).max(20),
  DURACION_BLOQUEO_LOGIN_MIN: z.coerce.number().int().min(1),
  EXPIRACION_SESION_ADMIN_MIN: z.coerce.number().int().min(5),
})

type FormValues = z.infer<typeof schema>

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map((c) => [c.clave, c.valor]))
}

export function SeguridadTab({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const map = toMap(configs)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      INTENTOS_LOGIN_ANTES_BLOQUEO: Number(
        map.INTENTOS_LOGIN_ANTES_BLOQUEO ?? 5
      ),
      DURACION_BLOQUEO_LOGIN_MIN: Number(map.DURACION_BLOQUEO_LOGIN_MIN ?? 15),
      EXPIRACION_SESION_ADMIN_MIN: Number(
        map.EXPIRACION_SESION_ADMIN_MIN ?? 30
      ),
    },
  })

  useEffect(() => {
    const m = toMap(configs)
    reset({
      INTENTOS_LOGIN_ANTES_BLOQUEO: Number(m.INTENTOS_LOGIN_ANTES_BLOQUEO ?? 5),
      DURACION_BLOQUEO_LOGIN_MIN: Number(m.DURACION_BLOQUEO_LOGIN_MIN ?? 15),
      EXPIRACION_SESION_ADMIN_MIN: Number(m.EXPIRACION_SESION_ADMIN_MIN ?? 30),
    })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      INTENTOS_LOGIN_ANTES_BLOQUEO: String(values.INTENTOS_LOGIN_ANTES_BLOQUEO),
      DURACION_BLOQUEO_LOGIN_MIN: String(values.DURACION_BLOQUEO_LOGIN_MIN),
      EXPIRACION_SESION_ADMIN_MIN: String(values.EXPIRACION_SESION_ADMIN_MIN),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
          <ShieldAlert className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Seguridad de acceso</h3>
          <p className="text-xs text-muted-foreground">
            Control de intentos fallidos y expiración de sesiones
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="INTENTOS_LOGIN_ANTES_BLOQUEO">
            Intentos antes de bloqueo
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="INTENTOS_LOGIN_ANTES_BLOQUEO"
              type="number"
              min={1}
              max={20}
              className="max-w-[120px]"
              {...register('INTENTOS_LOGIN_ANTES_BLOQUEO')}
            />
            <span className="text-sm text-muted-foreground">intentos</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Número de contraseñas incorrectas antes de bloquear la cuenta.
          </p>
          {errors.INTENTOS_LOGIN_ANTES_BLOQUEO && (
            <p className="text-xs text-destructive">
              {errors.INTENTOS_LOGIN_ANTES_BLOQUEO.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="DURACION_BLOQUEO_LOGIN_MIN">
            Duración del bloqueo
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="DURACION_BLOQUEO_LOGIN_MIN"
              type="number"
              min={1}
              className="max-w-[120px]"
              {...register('DURACION_BLOQUEO_LOGIN_MIN')}
            />
            <span className="text-sm text-muted-foreground">minutos</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tiempo que permanecerá bloqueada la cuenta tras los intentos
            fallidos.
          </p>
          {errors.DURACION_BLOQUEO_LOGIN_MIN && (
            <p className="text-xs text-destructive">
              {errors.DURACION_BLOQUEO_LOGIN_MIN.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="EXPIRACION_SESION_ADMIN_MIN">
            Expiración de sesión
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="EXPIRACION_SESION_ADMIN_MIN"
              type="number"
              min={5}
              className="max-w-[120px]"
              {...register('EXPIRACION_SESION_ADMIN_MIN')}
            />
            <span className="text-sm text-muted-foreground">
              minutos de inactividad
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tiempo máximo de inactividad antes de cerrar la sesión del
            administrador.
          </p>
          {errors.EXPIRACION_SESION_ADMIN_MIN && (
            <p className="text-xs text-destructive">
              {errors.EXPIRACION_SESION_ADMIN_MIN.message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <strong>Nota:</strong> Los cambios en seguridad afectan a todos los
        administradores del sistema. Los bloqueos activos no se modifican
        retroactivamente.
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          size="sm"
        >
          {actualizar.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
